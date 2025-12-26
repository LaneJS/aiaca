package com.aiaca.api.controller;

import com.aiaca.api.dto.AuthDtos;
import com.aiaca.api.service.AuthService;
import com.aiaca.api.security.JwtService;
import com.aiaca.api.service.billing.StripeCheckoutService;
import com.aiaca.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final StripeCheckoutService stripeCheckoutService;
    private final UserRepository userRepository;
    private final String successUrl;
    private final String cancelUrl;

    public AuthController(AuthService authService, JwtService jwtService, StripeCheckoutService stripeCheckoutService,
                          UserRepository userRepository,
                          @Value("${billing.stripe.success-url}") String successUrl,
                          @Value("${billing.stripe.cancel-url}") String cancelUrl) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.stripeCheckoutService = stripeCheckoutService;
        this.userRepository = userRepository;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        // Free registration is disabled - users must go through paid signup flow
        return ResponseEntity.status(403).body(java.util.Map.of(
            "code", "registration_disabled",
            "message", "Registration requires a paid subscription. Please sign up at /signup to continue."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register-checkout")
    public ResponseEntity<AuthDtos.RegisterCheckoutResponse> registerCheckout(
            @Valid @RequestBody AuthDtos.RegisterCheckoutRequest request) {
        com.aiaca.api.model.User user = authService.createUserWithoutLogin(
                request.email(),
                request.password(),
                request.name()
        );
        StripeCheckoutService.CheckoutSessionResult session = stripeCheckoutService.createCheckoutSession(
                user.getId(),
                request.email(),
                request.name(),
                successUrl,
                cancelUrl
        );
        if (session.customerId() != null && !session.customerId().isBlank()) {
            user.setStripeCustomerId(session.customerId());
            userRepository.save(user);
        }
        return ResponseEntity.ok(new AuthDtos.RegisterCheckoutResponse(user.getId(), session.checkoutUrl()));
    }
}
