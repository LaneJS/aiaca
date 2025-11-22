package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.CreateCouponRequest;
import com.aiaca.api.model.billing.Coupon;
import com.aiaca.api.repository.billing.CouponRepository;
import com.aiaca.api.util.JsonHelper;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponService {
    private final CouponRepository couponRepository;
    private final JsonHelper jsonHelper;

    public CouponService(CouponRepository couponRepository, JsonHelper jsonHelper) {
        this.couponRepository = couponRepository;
        this.jsonHelper = jsonHelper;
    }

    public List<Coupon> listCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(CreateCouponRequest request) {
        Coupon coupon = new Coupon();
        coupon.setCode(request.code());
        if (request.percentOff() != null) {
            coupon.setPercentOff(BigDecimal.valueOf(request.percentOff()));
        }
        coupon.setAmountOff(request.amountOff());
        coupon.setDuration(request.duration());
        coupon.setDurationInMonths(request.durationInMonths());
        coupon.setMaxRedemptions(request.maxRedemptions());
        coupon.setRedeemBy(request.redeemBy());
        coupon.setValid(request.valid() == null || request.valid());
        coupon.setMetadata(jsonHelper.toJson(request.metadata()));
        return couponRepository.save(coupon);
    }
}
