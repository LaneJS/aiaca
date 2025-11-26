package com.aiaca.api.exception;

import com.aiaca.api.model.billing.enums.SubscriptionStatus;

/**
 * Exception thrown when a user attempts to access a subscription-gated endpoint
 * without an active subscription. Maps to HTTP 402 Payment Required.
 */
public class PaymentRequiredException extends RuntimeException {

    private final SubscriptionStatus currentStatus;

    public PaymentRequiredException(String message, SubscriptionStatus currentStatus) {
        super(message);
        this.currentStatus = currentStatus;
    }

    public PaymentRequiredException(SubscriptionStatus currentStatus) {
        super("Active subscription required to access this resource. Current status: " + currentStatus);
        this.currentStatus = currentStatus;
    }

    public SubscriptionStatus getCurrentStatus() {
        return currentStatus;
    }
}
