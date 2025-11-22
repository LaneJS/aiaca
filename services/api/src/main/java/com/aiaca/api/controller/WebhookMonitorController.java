package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.PageResponse;
import com.aiaca.api.dto.billing.BillingDtos.WebhookEventResponse;
import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.service.billing.WebhookService;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/webhooks")
public class WebhookMonitorController {

    private final WebhookService webhookService;
    private final IdempotencyService idempotencyService;

    public WebhookMonitorController(WebhookService webhookService, IdempotencyService idempotencyService) {
        this.webhookService = webhookService;
        this.idempotencyService = idempotencyService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<WebhookEventResponse> listEvents(@RequestParam(name = "status", required = false) WebhookEventStatus status,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "25") int pageSize) {
        Page<WebhookEvent> results = webhookService.list(status, page, pageSize);
        List<WebhookEventResponse> items = results.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<WebhookEventResponse> updateStatus(@PathVariable UUID id,
                                                             @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                             @RequestParam WebhookEventStatus status,
                                                             @RequestParam(required = false) String lastError) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "WEBHOOK_EVENT", id.toString());
        WebhookEvent updated = webhookService.markStatus(id, status, lastError);
        return ResponseEntity.ok(toResponse(updated));
    }

    private WebhookEventResponse toResponse(WebhookEvent event) {
        return new WebhookEventResponse(
                event.getId(),
                event.getEventId(),
                event.getEventType(),
                event.getPayload(),
                event.getSignature(),
                event.getReceivedAt(),
                event.getProcessedAt(),
                event.getStatus(),
                event.getLastError(),
                event.getCreatedAt(),
                event.getUpdatedAt());
    }
}
