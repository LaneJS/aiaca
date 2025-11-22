package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.billing.Charge;
import com.aiaca.api.model.billing.CreditNote;
import com.aiaca.api.model.billing.Refund;
import com.aiaca.api.model.billing.enums.ChargeStatus;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.service.billing.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;
    private final AuditLogService auditLogService;

    public PaymentController(PaymentService paymentService, BillingMapper billingMapper, IdempotencyService idempotencyService, AuditLogService auditLogService) {
        this.paymentService = paymentService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/charges")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<ChargeResponse> listCharges(
            @RequestParam(name = "accountId", required = false) UUID accountId,
            @RequestParam(name = "status", required = false) ChargeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        Page<Charge> results = paymentService.listCharges(accountId, status, page, pageSize);
        List<ChargeResponse> items = results.getContent().stream().map(billingMapper::toChargeResponse).toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping("/charges")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ChargeResponse> createCharge(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateChargeRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CHARGE", request.accountId().toString());
        Charge charge = paymentService.createCharge(request);
        auditLogService.record(request.accountId(), principal.getId(), principal.getEmail(), "CHARGE_CREATED", "CHARGE", charge.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toChargeResponse(charge));
    }

    @PatchMapping("/charges/{chargeId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ChargeResponse> updateChargeStatus(@PathVariable UUID chargeId,
                                                             @AuthenticationPrincipal UserPrincipal principal,
                                                             @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                             @RequestParam ChargeStatus status,
                                                             @RequestParam(required = false) String failureCode,
                                                             @RequestParam(required = false) String failureMessage) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CHARGE", chargeId.toString());
        Charge updated = paymentService.markChargeStatus(chargeId, status, failureCode, failureMessage);
        auditLogService.record(updated.getAccount().getId(), principal.getId(), principal.getEmail(), "CHARGE_STATUS_UPDATED", "CHARGE", updated.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toChargeResponse(updated));
    }

    @PostMapping("/charges/{chargeId}/refunds")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<RefundResponse> refundCharge(@PathVariable UUID chargeId,
                                                       @AuthenticationPrincipal UserPrincipal principal,
                                                       @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                       @Valid @RequestBody CreateRefundRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "REFUND", chargeId.toString());
        Refund refund = paymentService.createRefund(chargeId, request);
        auditLogService.record(refund.getCharge().getAccount().getId(), principal.getId(), principal.getEmail(), "REFUND_CREATED", "REFUND", refund.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toRefundResponse(refund));
    }

    @PostMapping("/invoices/{invoiceId}/credit-notes")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<CreditNoteResponse> createCreditNote(@PathVariable UUID invoiceId,
                                                               @AuthenticationPrincipal UserPrincipal principal,
                                                               @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                               @Valid @RequestBody CreateCreditNoteRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "CREDIT_NOTE", invoiceId.toString());
        CreditNote creditNote = paymentService.createCreditNote(invoiceId, request);
        auditLogService.record(null, principal.getId(), principal.getEmail(), "CREDIT_NOTE_CREATED", "CREDIT_NOTE", creditNote.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toCreditNoteResponse(creditNote));
    }
}
