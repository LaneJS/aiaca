package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.billing.Subscription;
import com.aiaca.api.model.billing.SubscriptionItem;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.service.billing.SubscriptionService;
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
@RequestMapping("/api/v1/billing/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;
    private final AuditLogService auditLogService;

    public SubscriptionController(SubscriptionService subscriptionService,
                                  BillingMapper billingMapper,
                                  IdempotencyService idempotencyService,
                                  AuditLogService auditLogService) {
        this.subscriptionService = subscriptionService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<SubscriptionResponse> listSubscriptions(
            @RequestParam(name = "accountId", required = false) UUID accountId,
            @RequestParam(name = "status", required = false) SubscriptionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        Page<Subscription> results = subscriptionService.listSubscriptions(accountId, status, page, pageSize);
        List<SubscriptionResponse> items = results.getContent().stream()
                .map(sub -> billingMapper.toSubscriptionResponse(sub, subscriptionService.getItems(sub.getId())))
                .toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateSubscriptionRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "SUBSCRIPTION", request.accountId().toString());
        Subscription subscription = subscriptionService.createSubscription(request);
        List<SubscriptionItem> items = subscriptionService.getItems(subscription.getId());
        auditLogService.record(request.accountId(), principal.getId(), principal.getEmail(), "SUBSCRIPTION_CREATED", "SUBSCRIPTION", subscription.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toSubscriptionResponse(subscription, items));
    }

    @GetMapping("/{subscriptionId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public ResponseEntity<SubscriptionResponse> getSubscription(@PathVariable UUID subscriptionId) {
        Subscription subscription = subscriptionService.getSubscription(subscriptionId);
        List<SubscriptionItem> items = subscriptionService.getItems(subscriptionId);
        return ResponseEntity.ok(billingMapper.toSubscriptionResponse(subscription, items));
    }

    @PatchMapping("/{subscriptionId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<SubscriptionResponse> updateStatus(@PathVariable UUID subscriptionId,
                                                             @AuthenticationPrincipal UserPrincipal principal,
                                                             @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                             @Valid @RequestBody UpdateSubscriptionStatusRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "SUBSCRIPTION", subscriptionId.toString());
        Subscription updated = subscriptionService.updateStatus(subscriptionId, request);
        List<SubscriptionItem> items = subscriptionService.getItems(subscriptionId);
        auditLogService.record(updated.getAccount().getId(), principal.getId(), principal.getEmail(), "SUBSCRIPTION_STATUS_UPDATED", "SUBSCRIPTION", updated.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toSubscriptionResponse(updated, items));
    }
}
