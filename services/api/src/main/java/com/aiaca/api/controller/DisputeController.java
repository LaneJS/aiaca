package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.DisputeResponse;
import com.aiaca.api.model.billing.Dispute;
import com.aiaca.api.model.billing.enums.DisputeStatus;
import com.aiaca.api.service.billing.DisputeService;
import com.aiaca.api.service.billing.IdempotencyService;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/disputes")
public class DisputeController {

    private final DisputeService disputeService;
    private final IdempotencyService idempotencyService;

    public DisputeController(DisputeService disputeService, IdempotencyService idempotencyService) {
        this.disputeService = disputeService;
        this.idempotencyService = idempotencyService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public com.aiaca.api.dto.billing.BillingDtos.PageResponse<DisputeResponse> listDisputes(
            @RequestParam(name = "status", required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        Page<Dispute> results = disputeService.listDisputes(status, page, pageSize);
        List<DisputeResponse> items = results.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new com.aiaca.api.dto.billing.BillingDtos.PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<DisputeResponse> createDispute(@RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                         @RequestParam UUID chargeId,
                                                         @RequestParam(required = false) DisputeStatus status,
                                                         @RequestParam Long amount,
                                                         @RequestParam String currency,
                                                         @RequestParam(required = false) String reason) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "DISPUTE", chargeId.toString());
        Dispute dispute = disputeService.createDispute(chargeId, status, amount, currency, reason);
        return ResponseEntity.ok(toResponse(dispute));
    }

    @PatchMapping("/{disputeId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<DisputeResponse> updateStatus(@PathVariable UUID disputeId,
                                                        @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                        @RequestParam DisputeStatus status) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "DISPUTE", disputeId.toString());
        Dispute updated = disputeService.updateStatus(disputeId, status);
        return ResponseEntity.ok(toResponse(updated));
    }

    private DisputeResponse toResponse(Dispute dispute) {
        return new DisputeResponse(
                dispute.getId(),
                dispute.getCharge().getId(),
                dispute.getStatus(),
                dispute.getAmount(),
                dispute.getCurrency(),
                dispute.getReason(),
                dispute.getEvidenceDueAt(),
                dispute.getEvidenceSubmittedAt(),
                dispute.getClosedAt(),
                dispute.getStripeDisputeId(),
                java.util.Collections.emptyMap(),
                dispute.getCreatedAt(),
                dispute.getUpdatedAt());
    }
}
