package com.aiaca.api.service.billing;

import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.SubscriptionItem;
import com.aiaca.api.model.billing.Subscription;
import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.AccountStatus;
import com.aiaca.api.model.billing.enums.CollectionMethod;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.PriceRepository;
import com.aiaca.api.repository.billing.SubscriptionItemRepository;
import com.aiaca.api.repository.billing.SubscriptionRepository;
import com.aiaca.api.repository.billing.WebhookEventRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.model.Invoice;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
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
    private final AccountRepository accountRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;
    private final PriceRepository priceRepository;
    private final String webhookSecret;
    private final Long toleranceSeconds;

    public WebhookService(WebhookEventRepository webhookEventRepository,
                          UserRepository userRepository,
                          AccountRepository accountRepository,
                          SubscriptionRepository subscriptionRepository,
                          SubscriptionItemRepository subscriptionItemRepository,
                          PriceRepository priceRepository,
                          @Value("${billing.stripe.webhook-secret:}") String webhookSecret,
                          @Value("${billing.stripe.tolerance-seconds:300}") Long toleranceSeconds) {
        this.webhookEventRepository = webhookEventRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionItemRepository = subscriptionItemRepository;
        this.priceRepository = priceRepository;
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
            case "invoice.payment_succeeded":
                handleInvoicePaymentSucceeded(event);
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

        User user = resolveUserFromSession(session);
        if (user == null) {
            logger.warn("User not found for checkout session {}", session.getId());
            return;
        }

        String email = session.getCustomerEmail();
        String customerId = session.getCustomer();
        if (customerId != null && !customerId.isBlank()) {
            user.setStripeCustomerId(customerId);
        }
        user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);

        Account account = resolveOrCreateAccount(user, customerId, session.getCurrency(), email);
        userRepository.save(user);

        String priceId = null;
        Map<String, String> metadata = session.getMetadata();
        if (metadata != null) {
            priceId = metadata.get("price_id");
        }

        if (account != null && session.getSubscription() != null && !session.getSubscription().isBlank()) {
            upsertSubscriptionFromSession(session, account, priceId);
        }

        logger.info("Updated user {} subscription status to ACTIVE", user.getEmail());
    }

    private void handleSubscriptionUpdated(Event event) {
        com.stripe.model.Subscription stripeSubscription =
                (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (stripeSubscription == null) {
            logger.error("Failed to deserialize subscription from event");
            return;
        }

        String customerId = stripeSubscription.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Subscription updated but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        Account account = accountRepository.findByStripeCustomerId(customerId).orElse(null);
        if (account == null && user != null) {
            account = resolveOrCreateAccount(user, customerId, stripeSubscription.getCurrency(), user.getEmail());
        }
        if (account == null) {
            logger.warn("Account not found for Stripe customer ID: {}", customerId);
            return;
        }

        String stripeStatus = stripeSubscription.getStatus();
        SubscriptionStatus newStatus = mapStripeStatusToSubscriptionStatus(stripeStatus);
        if (user != null) {
            user.setSubscriptionStatus(newStatus);
            userRepository.save(user);
        }

        Subscription localSubscription = subscriptionRepository
                .findByStripeSubscriptionId(stripeSubscription.getId())
                .orElse(null);
        if (localSubscription == null) {
            localSubscription = new Subscription();
            localSubscription.setAccount(account);
            localSubscription.setStripeSubscriptionId(stripeSubscription.getId());
        }

        localSubscription.setStatus(newStatus);
        localSubscription.setCurrency(normalizeCurrency(stripeSubscription.getCurrency(), account.getCurrency()));
        localSubscription.setCurrentPeriodStart(toLocalDateTime(stripeSubscription.getCurrentPeriodStart()));
        localSubscription.setCurrentPeriodEnd(toLocalDateTime(stripeSubscription.getCurrentPeriodEnd()));
        localSubscription.setTrialEnd(toLocalDateTime(stripeSubscription.getTrialEnd()));
        localSubscription.setCancelAt(toLocalDateTime(stripeSubscription.getCancelAt()));
        localSubscription.setCanceledAt(toLocalDateTime(stripeSubscription.getCanceledAt()));
        localSubscription.setEndedAt(toLocalDateTime(stripeSubscription.getEndedAt()));
        localSubscription.setCollectionMethod(mapCollectionMethod(stripeSubscription.getCollectionMethod()));
        localSubscription = subscriptionRepository.save(localSubscription);

        if (stripeSubscription.getItems() != null && stripeSubscription.getItems().getData() != null) {
            for (com.stripe.model.SubscriptionItem stripeItem : stripeSubscription.getItems().getData()) {
                syncSubscriptionItem(localSubscription, stripeItem);
            }
        }

        logger.info("Updated subscription {} to status {}", stripeSubscription.getId(), newStatus);
    }

    private void handleSubscriptionDeleted(Event event) {
        com.stripe.model.Subscription stripeSubscription =
                (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (stripeSubscription == null) {
            logger.error("Failed to deserialize subscription from event");
            return;
        }

        String customerId = stripeSubscription.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Subscription deleted but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        if (user != null) {
            user.setSubscriptionStatus(SubscriptionStatus.CANCELED);
            userRepository.save(user);
        }

        Subscription local = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId()).orElse(null);
        if (local != null) {
            local.setStatus(SubscriptionStatus.CANCELED);
            local.setCanceledAt(LocalDateTime.now());
            local.setEndedAt(LocalDateTime.now());
            subscriptionRepository.save(local);
        }

        logger.info("Updated subscription {} status to CANCELED", stripeSubscription.getId());
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
        if (user != null) {
            user.setSubscriptionStatus(SubscriptionStatus.PAST_DUE);
            userRepository.save(user);
        }

        updateSubscriptionStatusFromInvoice(invoice, SubscriptionStatus.PAST_DUE);

        logger.info("Updated subscription status to PAST_DUE for customer {}", customerId);
    }

    private void handleInvoicePaymentSucceeded(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null) {
            logger.error("Failed to deserialize invoice from event");
            return;
        }

        String customerId = invoice.getCustomer();
        if (customerId == null || customerId.isBlank()) {
            logger.warn("Invoice payment succeeded but no customer ID found");
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
        if (user != null) {
            user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            userRepository.save(user);
        }

        updateSubscriptionStatusFromInvoice(invoice, SubscriptionStatus.ACTIVE);

        logger.info("Updated subscription status to ACTIVE for customer {}", customerId);
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

    private User resolveUserFromSession(Session session) {
        String userId = session.getClientReferenceId();
        Map<String, String> metadata = session.getMetadata();
        if (metadata != null && metadata.get("user_id") != null) {
            userId = metadata.get("user_id");
        }
        if (userId != null) {
            try {
                return userRepository.findById(UUID.fromString(userId)).orElse(null);
            } catch (IllegalArgumentException ex) {
                logger.warn("Invalid user_id metadata in checkout session {}", session.getId());
            }
        }

        String customerId = session.getCustomer();
        if (customerId != null && !customerId.isBlank()) {
            User user = userRepository.findByStripeCustomerId(customerId).orElse(null);
            if (user != null) {
                return user;
            }
        }

        String email = session.getCustomerEmail();
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email).orElse(null);
        }

        return null;
    }

    private Account resolveOrCreateAccount(User user, String customerId, String currency, String email) {
        Account account = null;
        if (user.getAccountId() != null) {
            account = accountRepository.findById(user.getAccountId()).orElse(null);
        }

        if (account == null && customerId != null && !customerId.isBlank()) {
            account = accountRepository.findByStripeCustomerId(customerId).orElse(null);
        }

        if (account == null) {
            account = new Account();
            account.setOwner(user);
            account.setName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getEmail());
            account.setStatus(AccountStatus.ACTIVE);
            account.setCurrency(normalizeCurrency(currency, "USD"));
            account.setStripeCustomerId(customerId);
            account.setPrimaryContactEmail(email != null && !email.isBlank() ? email : user.getEmail());
            account = accountRepository.save(account);
        } else if (customerId != null && !customerId.isBlank() &&
                (account.getStripeCustomerId() == null || account.getStripeCustomerId().isBlank())) {
            account.setStripeCustomerId(customerId);
            account = accountRepository.save(account);
        }

        if (user.getAccountId() == null && account != null) {
            user.setAccountId(account.getId());
        }

        return account;
    }

    private void upsertSubscriptionFromSession(Session session, Account account, String stripePriceId) {
        String stripeSubscriptionId = session.getSubscription();
        if (stripeSubscriptionId == null || stripeSubscriptionId.isBlank()) {
            return;
        }

        Subscription local = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId).orElse(null);
        if (local == null) {
            local = new Subscription();
            local.setAccount(account);
            local.setStripeSubscriptionId(stripeSubscriptionId);
            local.setStatus(SubscriptionStatus.ACTIVE);
            local.setCurrency(normalizeCurrency(session.getCurrency(), account.getCurrency()));
            local.setCollectionMethod(CollectionMethod.CHARGE_AUTOMATICALLY);
            local.setStartDate(LocalDateTime.now());
            local.setCurrentPeriodStart(LocalDateTime.now());
            local = subscriptionRepository.save(local);
        }

        if (stripePriceId != null && !stripePriceId.isBlank()) {
            Price price = priceRepository.findByStripePriceId(stripePriceId).orElse(null);
            if (price != null) {
                SubscriptionItem item = subscriptionItemRepository
                        .findBySubscriptionIdAndPriceId(local.getId(), price.getId())
                        .orElse(null);
                if (item == null) {
                    item = new SubscriptionItem();
                    item.setSubscription(local);
                    item.setPrice(price);
                    item.setQuantity(1);
                    subscriptionItemRepository.save(item);
                }
            } else {
                logger.warn("No local price found for Stripe price {}", stripePriceId);
            }
        }
    }

    private void syncSubscriptionItem(Subscription subscription, com.stripe.model.SubscriptionItem stripeItem) {
        if (stripeItem == null) {
            return;
        }
        String stripeItemId = stripeItem.getId();
        String stripePriceId = stripeItem.getPrice() != null ? stripeItem.getPrice().getId() : null;
        if (stripePriceId == null || stripePriceId.isBlank()) {
            logger.warn("Stripe subscription item {} missing price ID", stripeItemId);
            return;
        }

        Price price = priceRepository.findByStripePriceId(stripePriceId).orElse(null);
        if (price == null) {
            logger.warn("No local price found for Stripe price {}", stripePriceId);
            return;
        }

        SubscriptionItem item = null;
        if (stripeItemId != null && !stripeItemId.isBlank()) {
            item = subscriptionItemRepository.findByStripeSubscriptionItemId(stripeItemId).orElse(null);
        }
        if (item == null) {
            item = subscriptionItemRepository.findBySubscriptionIdAndPriceId(subscription.getId(), price.getId())
                    .orElse(null);
        }
        if (item == null) {
            item = new SubscriptionItem();
            item.setSubscription(subscription);
            item.setPrice(price);
        }

        Long quantity = stripeItem.getQuantity();
        item.setQuantity(quantity != null ? Math.toIntExact(quantity) : 1);
        item.setStripeSubscriptionItemId(stripeItemId);
        subscriptionItemRepository.save(item);
    }

    private void updateSubscriptionStatusFromInvoice(Invoice invoice, SubscriptionStatus status) {
        String stripeSubscriptionId = invoice.getSubscription();
        if (stripeSubscriptionId == null || stripeSubscriptionId.isBlank()) {
            return;
        }
        Subscription subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId).orElse(null);
        if (subscription == null) {
            return;
        }
        subscription.setStatus(status);
        subscriptionRepository.save(subscription);
    }

    private LocalDateTime toLocalDateTime(Long epochSeconds) {
        if (epochSeconds == null) {
            return null;
        }
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }

    private CollectionMethod mapCollectionMethod(String stripeValue) {
        if (stripeValue == null) {
            return null;
        }
        if ("charge_automatically".equalsIgnoreCase(stripeValue)) {
            return CollectionMethod.CHARGE_AUTOMATICALLY;
        }
        if ("send_invoice".equalsIgnoreCase(stripeValue)) {
            return CollectionMethod.SEND_INVOICE;
        }
        return null;
    }

    private String normalizeCurrency(String currency, String fallback) {
        if (currency != null && !currency.isBlank()) {
            return currency.toUpperCase();
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback.toUpperCase();
        }
        return "USD";
    }
}
