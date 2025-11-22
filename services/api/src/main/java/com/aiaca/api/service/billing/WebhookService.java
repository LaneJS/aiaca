package com.aiaca.api.service.billing;

import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.repository.billing.WebhookEventRepository;
import com.stripe.model.Event;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {

    private final WebhookEventRepository webhookEventRepository;
    private final String webhookSecret;
    private final Long toleranceSeconds;

    public WebhookService(WebhookEventRepository webhookEventRepository,
                          @Value("${billing.stripe.webhook-secret:}") String webhookSecret,
                          @Value("${billing.stripe.tolerance-seconds:300}") Long toleranceSeconds) {
        this.webhookEventRepository = webhookEventRepository;
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
}
