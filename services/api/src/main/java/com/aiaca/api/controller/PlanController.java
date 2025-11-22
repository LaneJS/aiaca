package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.billing.Plan;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.enums.PlanStatus;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import com.aiaca.api.service.billing.PlanService;
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
@RequestMapping("/api/v1/billing/plans")
public class PlanController {

    private final PlanService planService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;
    private final AuditLogService auditLogService;

    public PlanController(PlanService planService, BillingMapper billingMapper, IdempotencyService idempotencyService, AuditLogService auditLogService) {
        this.planService = planService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<PlanResponse> listPlans(@RequestParam(name = "status", required = false) PlanStatus status,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "25") int pageSize) {
        Page<Plan> results = planService.listPlans(status, page, pageSize);
        List<PlanResponse> items = results.getContent().stream().map(billingMapper::toPlanResponse).toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<PlanResponse> createPlan(@AuthenticationPrincipal UserPrincipal principal,
                                                   @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                   @Valid @RequestBody CreatePlanRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PLAN", request.code());
        Plan plan = planService.createPlan(request);
        auditLogService.record(null, principal.getId(), principal.getEmail(), "PLAN_CREATED", "PLAN", plan.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toPlanResponse(plan));
    }

    @PatchMapping("/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<PlanResponse> updatePlan(@PathVariable UUID planId,
                                                   @AuthenticationPrincipal UserPrincipal principal,
                                                   @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                   @Valid @RequestBody CreatePlanRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PLAN", planId.toString());
        Plan plan = planService.updatePlan(planId, request);
        auditLogService.record(null, principal.getId(), principal.getEmail(), "PLAN_UPDATED", "PLAN", plan.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toPlanResponse(plan));
    }

    @PostMapping("/{planId}/prices")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<PriceResponse> addPrice(@PathVariable UUID planId,
                                                  @AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                  @Valid @RequestBody CreatePriceRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "PRICE", planId.toString());
        Price price = planService.addPrice(planId, request);
        auditLogService.record(null, principal.getId(), principal.getEmail(), "PRICE_CREATED", "PRICE", price.getId().toString(), null, null);
        return ResponseEntity.ok(billingMapper.toPriceResponse(price));
    }

    @GetMapping("/{planId}/prices")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<PriceResponse> listPrices(@PathVariable UUID planId) {
        return planService.listPrices(planId).stream().map(billingMapper::toPriceResponse).toList();
    }
}
