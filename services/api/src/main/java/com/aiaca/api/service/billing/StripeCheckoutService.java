package com.aiaca.api.service.billing;

import com.aiaca.api.exception.BadRequestException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerCollection;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerListParams;
import com.stripe.param.SubscriptionListParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.billingportal.SessionCreateParams.Builder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeCheckoutService {

    private static final Logger logger = LoggerFactory.getLogger(StripeCheckoutService.class);

    private final String stripeSecretKey;
    private final String stripePriceId;

    public StripeCheckoutService(@Value("${billing.stripe.secret-key:}") String stripeSecretKey,
                                 @Value("${billing.stripe.price-id:}") String stripePriceId) {
        this.stripeSecretKey = stripeSecretKey;
        this.stripePriceId = stripePriceId;
        if (stripeSecretKey != null && !stripeSecretKey.isBlank()) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    public String createCheckoutSession(String email, String name, String successUrl, String cancelUrl) {
        validateStripeConfiguration();

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (successUrl == null || successUrl.isBlank()) {
            throw new BadRequestException("Success URL is required");
        }
        if (cancelUrl == null || cancelUrl.isBlank()) {
            throw new BadRequestException("Cancel URL is required");
        }

        try {
            String customerId = findOrCreateCustomer(email, name);

            Map<String, String> metadata = new HashMap<>();
            metadata.put("customer_email", email);
            if (name != null && !name.isBlank()) {
                metadata.put("customer_name", name);
            }

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .setCustomerEmail(email)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(stripePriceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .putAllMetadata(metadata)
                    .build();

            Session session = Session.create(params);
            logger.info("Created Stripe checkout session for customer: {}, session ID: {}", customerId, session.getId());
            return session.getUrl();
        } catch (StripeException e) {
            logger.error("Failed to create checkout session for email: {}", email, e);
            throw new BadRequestException("Failed to create checkout session: " + e.getMessage());
        }
    }

    public String createCustomerPortalSession(String stripeCustomerId, String returnUrl) {
        validateStripeConfiguration();

        if (stripeCustomerId == null || stripeCustomerId.isBlank()) {
            throw new BadRequestException("Stripe customer ID is required");
        }
        if (returnUrl == null || returnUrl.isBlank()) {
            throw new BadRequestException("Return URL is required");
        }

        try {
            com.stripe.param.billingportal.SessionCreateParams params =
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                            .setCustomer(stripeCustomerId)
                            .setReturnUrl(returnUrl)
                            .build();

            com.stripe.model.billingportal.Session session =
                    com.stripe.model.billingportal.Session.create(params);
            logger.info("Created Stripe billing portal session for customer: {}, session ID: {}",
                    stripeCustomerId, session.getId());
            return session.getUrl();
        } catch (StripeException e) {
            logger.error("Failed to create customer portal session for customer: {}", stripeCustomerId, e);
            throw new BadRequestException("Failed to create customer portal session: " + e.getMessage());
        }
    }

    public String getSubscriptionStatus(String stripeCustomerId) {
        validateStripeConfiguration();

        if (stripeCustomerId == null || stripeCustomerId.isBlank()) {
            throw new BadRequestException("Stripe customer ID is required");
        }

        try {
            SubscriptionListParams params = SubscriptionListParams.builder()
                    .setCustomer(stripeCustomerId)
                    .setLimit(1L)
                    .build();

            List<Subscription> subscriptions = Subscription.list(params).getData();

            if (subscriptions.isEmpty()) {
                logger.debug("No active subscriptions found for customer: {}", stripeCustomerId);
                return "none";
            }

            String status = subscriptions.get(0).getStatus();
            logger.debug("Subscription status for customer {}: {}", stripeCustomerId, status);
            return status;
        } catch (StripeException e) {
            logger.error("Failed to retrieve subscription status for customer: {}", stripeCustomerId, e);
            throw new BadRequestException("Failed to retrieve subscription status: " + e.getMessage());
        }
    }

    private String findOrCreateCustomer(String email, String name) throws StripeException {
        CustomerListParams listParams = CustomerListParams.builder()
                .setEmail(email)
                .setLimit(1L)
                .build();

        CustomerCollection customers = Customer.list(listParams);

        if (!customers.getData().isEmpty()) {
            String existingCustomerId = customers.getData().get(0).getId();
            logger.debug("Found existing Stripe customer for email {}: {}", email, existingCustomerId);
            return existingCustomerId;
        }

        CustomerCreateParams.Builder createParamsBuilder = CustomerCreateParams.builder()
                .setEmail(email);

        if (name != null && !name.isBlank()) {
            createParamsBuilder.setName(name);
        }

        Customer customer = Customer.create(createParamsBuilder.build());
        logger.info("Created new Stripe customer for email {}: {}", email, customer.getId());
        return customer.getId();
    }

    private void validateStripeConfiguration() {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new BadRequestException("Stripe secret key not configured");
        }
        if (stripePriceId == null || stripePriceId.isBlank()) {
            throw new BadRequestException("Stripe price ID not configured");
        }
    }
}
