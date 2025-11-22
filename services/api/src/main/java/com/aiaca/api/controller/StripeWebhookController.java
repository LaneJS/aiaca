package com.aiaca.api.controller;

import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.service.billing.WebhookService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/stripe")
public class StripeWebhookController {

    private final WebhookService webhookService;

    public StripeWebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping
    public ResponseEntity<Void> receiveStripeEvent(@RequestHeader(name = "Stripe-Signature", required = false) String signatureHeader,
                                                   HttpServletRequest request) throws IOException {
        String payload = readBody(request);
        WebhookEvent event = webhookService.processStripeEvent(payload, signatureHeader);
        webhookService.markStatus(event.getId(), WebhookEventStatus.PROCESSED, null);
        return ResponseEntity.ok().build();
    }

    private String readBody(HttpServletRequest request) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }
}
