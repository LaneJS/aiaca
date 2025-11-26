package com.aiaca.api.service.billing;

import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.repository.billing.WebhookEventRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.model.Subscription;
import com.stripe.model.Invoice;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import java.time.LocalDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);

    private final WebhookEventRepository webhookEventRepository;
    private final UserRepository userRepository;
    private final String webhookSecret;
    private final Long toleranceSeconds;

    public WebhookService(WebhookEventRepository webhookEventRepository,
                          UserRepository userRepository,
                          @Value("${billing.stripe.webhook-secret:}") String webhookSecret,
                          @Value("${billing.stripe.tolerance-seconds:300}") Long toleranceSeconds) {
        this.webhookEventRepository = webhookEventRepository;
        this.userRepository = userRepository;
        this.webhookSecret = webhookSecret;
        this.toleranceSeconds = toleranceSeconds;
    }

    public Page<WebhookEvent> list(WebhookEventStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (status != null) {
            return webhookEventRepository.findByStatus(status, pageable);
        }
        return webhookEventRepository.findAll(pageable);
    }

    public WebhookEvent get(UUID id) {
        return webhookEventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Webhook event not found"));
    }

    @Transactional
    public WebhookEvent markStatus(UUID id, WebhookEventStatus status, String lastError) {
        WebhookEvent event = get(id);
        event.setStatus(status);
        event.setLastError(lastError);
        if (status == WebhookEventStatus.PROCESSED) {
            event.setProcessedAt(LocalDateTime.now());
        }
        return webhookEventRepository.save(event);
    }

    @Transactional
    public WebhookEvent processStripeEvent(String payload, String signatureHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new BadRequestException("Stripe webhook secret not configured");
        }
        try {
            Event event = Webhook.constructEvent(payload, signatureHeader, webhookSecret, toleranceSeconds);
            String eventId = event.getId();
            WebhookEvent existing = webhookEventRepository.findByEventId(eventId).orElse(null);
            if (existing != null) {
                return existing;
            }
            WebhookEvent saved = new WebhookEvent();
            saved.setEventId(eventId);
            saved.setEventType(event.getType());
            saved.setPayload(payload);
            saved.setSignature(signatureHeader);
            saved.setReceivedAt(LocalDateTime.now());
            saved.setStatus(WebhookEventStatus.RECEIVED);
            saved = webhookEventRepository.save(saved);

            // Process the event and update user subscription status
            try {
                handleStripeEvent(event);
                saved.setStatus(WebhookEventStatus.PROCESSED);
                saved.setProcessedAt(LocalDateTime.now());
            } catch (Exception e) {
                logger.error("Failed to process webhook event: {}", eventId, e);
                saved.setStatus(WebhookEventStatus.FAILED);
                saved.setLastError(e.getMessage());
            }
            return webhookEventRepository.save(saved);
        } catch (SignatureVerificationException e) {
            WebhookEvent failed = new WebhookEvent();
            failed.setEventId(UUID.randomUUID().toString());
            failed.setEventType("invalid_signature");
            failed.setPayload(payload);
            failed.setSignature(signatureHeader);
            failed.setReceivedAt(LocalDateTime.now());
            failed.setStatus(WebhookEventStatus.FAILED);
            failed.setLastError("Invalid signature");
            webhookEventRepository.save(failed);
            throw new BadRequestException("Invalid signature");
        }
    }

    private void handleStripeEvent(Event event) {
        String eventType = event.getType();
        logger.info("Processing Stripe webhook event: {}", eventType);

        switch (eventType) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;
            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;
            case "invoice.payment_failed":
                handleInvoicePaymentFailed(event);
                break;
            default:
                logger.debug("Unhandled event type: {}", eventType);
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) {
            logger.error("Failed to deserialize checkout session from event");
            return;
        }

        String email = session.getCustomerEmail();
        String customerId = session.getCustomer();

        if (email == null || email.isBlank()) {
            logger.warn("Checkout session completed but no customer email found");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            logger.warn("User not found for email: {}", email);
            return;
        }

        if (customerId != null && !customerId.isBlank()) {
            user.setStripeCustomerId(customerId);
        }
        user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        userRepository.save(user);

        logger.info("Updated user {} subscription status to ACTIVE", email);
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) {
            logger.error("Failed to deserialize subscription from event");
            return;
        }

        String customerId = subscription.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Subscription updated but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        if (user == null) {
            logger.warn("User not found for Stripe customer ID: {}", customerId);
            return;
        }

        String stripeStatus = subscription.getStatus();
        SubscriptionStatus newStatus = mapStripeStatusToSubscriptionStatus(stripeStatus);
        user.setSubscriptionStatus(newStatus);
        userRepository.save(user);

        logger.info("Updated user with customer ID {} subscription status to {}", customerId, newStatus);
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) {
            logger.error("Failed to deserialize subscription from event");
            return;
        }

        String customerId = subscription.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Subscription deleted but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        if (user == null) {
            logger.warn("User not found for Stripe customer ID: {}", customerId);
            return;
        }

        user.setSubscriptionStatus(SubscriptionStatus.CANCELED);
        userRepository.save(user);

        logger.info("Updated user with customer ID {} subscription status to CANCELED", customerId);
    }

    private void handleInvoicePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null) {
            logger.error("Failed to deserialize invoice from event");
            return;
        }

        String customerId = invoice.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Invoice payment failed but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        if (user == null) {
            logger.warn("User not found for Stripe customer ID: {}", customerId);
            return;
        }

        user.setSubscriptionStatus(SubscriptionStatus.PAST_DUE);
        userRepository.save(user);

        logger.info("Updated user with customer ID {} subscription status to PAST_DUE", customerId);
    }

    private SubscriptionStatus mapStripeStatusToSubscriptionStatus(String stripeStatus) {
        if (stripeStatus == null) {
            return SubscriptionStatus.NONE;
        }

        switch (stripeStatus.toLowerCase()) {
            case "incomplete":
                return SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired":
                return SubscriptionStatus.INCOMPLETE_EXPIRED;
            case "trialing":
                return SubscriptionStatus.TRIALING;
            case "active":
                return SubscriptionStatus.ACTIVE;
            case "past_due":
                return SubscriptionStatus.PAST_DUE;
            case "canceled":
                return SubscriptionStatus.CANCELED;
            case "unpaid":
                return SubscriptionStatus.UNPAID;
            case "paused":
                return SubscriptionStatus.PAUSED;
            default:
                logger.warn("Unknown Stripe subscription status: {}", stripeStatus);
                return SubscriptionStatus.NONE;
        }
    }
}
