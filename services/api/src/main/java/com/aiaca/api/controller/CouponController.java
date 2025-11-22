package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.CreateCouponRequest;
import com.aiaca.api.dto.billing.BillingDtos.CouponResponse;
import com.aiaca.api.model.billing.Coupon;
import com.aiaca.api.service.billing.CouponService;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.IdempotencyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/coupons")
public class CouponController {

    private final CouponService couponService;
    private final BillingMapper billingMapper;
    private final IdempotencyService idempotencyService;

    public CouponController(CouponService couponService, BillingMapper billingMapper, IdempotencyService idempotencyService) {
        this.couponService = couponService;
        this.billingMapper = billingMapper;
        this.idempotencyService = idempotencyService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<CouponResponse> listCoupons() {
        return couponService.listCoupons().stream().map(billingMapper::toCouponResponse).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<CouponResponse> createCoupon(@RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                       @Valid @RequestBody CreateCouponRequest request) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "COUPON", request.code());
        Coupon coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(billingMapper.toCouponResponse(coupon));
    }
}
