package com.aiaca.api.security;

import com.aiaca.api.exception.PaymentRequiredException;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Set;

/**
 * AOP aspect that intercepts methods annotated with @RequiresSubscription
 * and validates the user's subscription status.
 */
@Aspect
@Component
public class SubscriptionAspect {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionAspect.class);
    private static final Set<String> READ_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    @Before("@annotation(com.aiaca.api.security.RequiresSubscription)")
    public void checkSubscription(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Subscription check failed: No authenticated user");
            throw new PaymentRequiredException("Authentication required", SubscriptionStatus.NONE);
        }

        if (!(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            logger.warn("Subscription check failed: Principal is not UserPrincipal");
            throw new PaymentRequiredException("Invalid authentication principal", SubscriptionStatus.NONE);
        }

        SubscriptionStatus currentStatus = userPrincipal.getSubscriptionStatus();
        if (currentStatus == null) {
            currentStatus = SubscriptionStatus.NONE;
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequiresSubscription annotation = method.getAnnotation(RequiresSubscription.class);

        SubscriptionStatus[] allowedStatuses = annotation.value();
        boolean allowPastDueReads = annotation.allowPastDueReads();

        if (Arrays.asList(allowedStatuses).contains(currentStatus)) {
            logger.debug("Subscription check passed for user {} with status {}",
                userPrincipal.getEmail(), currentStatus);
            return;
        }

        if (allowPastDueReads && currentStatus == SubscriptionStatus.PAST_DUE) {
            if (isReadOperation()) {
                logger.debug("Allowing PAST_DUE user {} to perform read operation",
                    userPrincipal.getEmail());
                return;
            } else {
                logger.warn("Blocking PAST_DUE user {} from write operation",
                    userPrincipal.getEmail());
                throw new PaymentRequiredException(
                    "Write operations require an active subscription. Please update your payment method.",
                    currentStatus
                );
            }
        }

        logger.warn("Subscription check failed for user {} with status {}. Required: {}",
            userPrincipal.getEmail(), currentStatus, Arrays.toString(allowedStatuses));
        throw new PaymentRequiredException(currentStatus);
    }

    private boolean isReadOperation() {
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String method = request.getMethod();
            return READ_METHODS.contains(method.toUpperCase());
        }

        return false;
    }
}
