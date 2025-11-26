package com.aiaca.api.controller;

import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.StripeCheckoutService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class BillingController {
    private final StripeCheckoutService stripeCheckoutService;
    private final UserRepository userRepository;
    private final String successUrl;
    private final String cancelUrl;
    private final String returnUrl;

    public BillingController(
            StripeCheckoutService stripeCheckoutService,
            UserRepository userRepository,
            @Value("${billing.stripe.success-url}") String successUrl,
            @Value("${billing.stripe.cancel-url}") String cancelUrl,
            @Value("${billing.stripe.return-url:http://localhost:4200/overview}") String returnUrl) {
        this.stripeCheckoutService = stripeCheckoutService;
        this.userRepository = userRepository;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
        this.returnUrl = returnUrl;
    }

    @GetMapping("/users/me/subscription")
    public ResponseEntity<SubscriptionStatusResponse> getSubscriptionStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        SubscriptionStatus status = user.getSubscriptionStatus();
        if (status == null) {
            status = SubscriptionStatus.NONE;
        }

        return ResponseEntity.ok(new SubscriptionStatusResponse(status));
    }

    @PostMapping("/billing/checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String email = user.getEmail();
        String name = user.getFullName();

        String checkoutUrl = stripeCheckoutService.createCheckoutSession(
                email,
                name,
                successUrl,
                cancelUrl
        );

        return ResponseEntity.ok(new CheckoutSessionResponse(checkoutUrl));
    }

    @PostMapping("/billing/portal-session")
    public ResponseEntity<PortalSessionResponse> createPortalSession(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String stripeCustomerId = user.getStripeCustomerId();
        if (stripeCustomerId == null || stripeCustomerId.isBlank()) {
            throw new BadRequestException("User does not have a Stripe customer ID");
        }

        String portalUrl = stripeCheckoutService.createCustomerPortalSession(
                stripeCustomerId,
                returnUrl
        );

        return ResponseEntity.ok(new PortalSessionResponse(portalUrl));
    }

    public record SubscriptionStatusResponse(SubscriptionStatus status) {}
    public record CheckoutSessionResponse(String checkoutUrl) {}
    public record PortalSessionResponse(String portalUrl) {}
}
