package com.aiaca.api.model.billing.enums;

public enum SubscriptionStatus {
    NONE,
    INCOMPLETE,
    INCOMPLETE_EXPIRED,
    TRIALING,
    ACTIVE,
    PAST_DUE,
    CANCELED,
    UNPAID,
    PAUSED,
    EXPIRED
}
