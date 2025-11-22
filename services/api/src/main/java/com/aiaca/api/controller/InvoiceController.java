package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.InvoiceLine;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.service.billing.InvoiceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;
    private final AuditLogService auditLogService;

    public InvoiceController(InvoiceService invoiceService, BillingMapper billingMapper, IdempotencyService idempotencyService, AuditLogService auditLogService) {
        this.invoiceService = invoiceService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<InvoiceResponse> listInvoices(
            @RequestParam(name = "accountId", required = false) UUID accountId,
            @RequestParam(name = "status", required = false) InvoiceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        Page<Invoice> results = invoiceService.listInvoices(accountId, status, page, pageSize);
        List<InvoiceResponse> items = results.getContent().stream()
                .map(inv -> billingMapper.toInvoiceResponse(inv, invoiceService.getLines(inv.getId())))
                .toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateInvoiceRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "INVOICE", request.accountId().toString());
        Invoice invoice = invoiceService.createInvoice(request);
        List<InvoiceLine> lines = invoiceService.getLines(invoice.getId());
        auditLogService.record(request.accountId(), principal.getId(), principal.getEmail(), "INVOICE_CREATED", "INVOICE", invoice.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toInvoiceResponse(invoice, lines));
    }

    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable UUID invoiceId) {
        Invoice invoice = invoiceService.getInvoice(invoiceId);
        List<InvoiceLine> lines = invoiceService.getLines(invoiceId);
        return ResponseEntity.ok(billingMapper.toInvoiceResponse(invoice, lines));
    }
}
