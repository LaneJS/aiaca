package com.aiaca.api.security;

import com.aiaca.api.model.billing.enums.SubscriptionStatus;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to gate API endpoints based on subscription status.
 * Apply to methods that require an active subscription.
 *
 * By default, allows ACTIVE and TRIALING statuses.
 * Can be customized to allow specific statuses.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresSubscription {

    /**
     * Subscription statuses that are allowed to access this endpoint.
     * Defaults to ACTIVE and TRIALING.
     */
    SubscriptionStatus[] value() default {SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING};

    /**
     * Whether to allow read operations for PAST_DUE status.
     * If true, PAST_DUE users can access GET requests but not write operations.
     */
    boolean allowPastDueReads() default false;
}
