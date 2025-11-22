package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.CreatePlanRequest;
import com.aiaca.api.dto.billing.BillingDtos.CreatePriceRequest;
import com.aiaca.api.dto.billing.BillingDtos.PlanResponse;
import com.aiaca.api.dto.billing.BillingDtos.PriceResponse;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Plan;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.enums.PlanStatus;
import com.aiaca.api.repository.billing.PlanRepository;
import com.aiaca.api.repository.billing.PriceRepository;
import com.aiaca.api.util.JsonHelper;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class PlanService {

    private final PlanRepository planRepository;
    private final PriceRepository priceRepository;
    private final JsonHelper jsonHelper;
    private final BillingMapper billingMapper;

    public PlanService(PlanRepository planRepository, PriceRepository priceRepository, JsonHelper jsonHelper, BillingMapper billingMapper) {
        this.planRepository = planRepository;
        this.priceRepository = priceRepository;
        this.jsonHelper = jsonHelper;
        this.billingMapper = billingMapper;
    }

    public Page<Plan> listPlans(PlanStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (status != null) {
            return planRepository.findByStatus(status, pageable);
        }
        return planRepository.findAll(pageable);
    }

    public Plan getPlan(UUID planId) {
        return planRepository.findById(planId).orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    }

    @Transactional
    public Plan createPlan(CreatePlanRequest request) {
        Plan plan = new Plan();
        plan.setCode(request.code());
        plan.setName(request.name());
        plan.setDescription(request.description());
        plan.setStatus(request.status() != null ? request.status() : PlanStatus.ACTIVE);
        plan.setMetadata(jsonHelper.toJson(request.metadata()));
        return planRepository.save(plan);
    }

    @Transactional
    public Plan updatePlan(UUID planId, CreatePlanRequest request) {
        Plan plan = getPlan(planId);
        if (StringUtils.hasText(request.code())) {
            plan.setCode(request.code());
        }
        if (StringUtils.hasText(request.name())) {
            plan.setName(request.name());
        }
        if (request.description() != null) {
            plan.setDescription(request.description());
        }
        if (request.status() != null) {
            plan.setStatus(request.status());
        }
        if (request.metadata() != null) {
            plan.setMetadata(jsonHelper.toJson(request.metadata()));
        }
        return planRepository.save(plan);
    }

    @Transactional
    public Price addPrice(UUID planId, CreatePriceRequest request) {
        Plan plan = getPlan(planId);
        Price price = new Price();
        price.setPlan(plan);
        price.setAmount(request.amount());
        price.setCurrency(request.currency());
        price.setInterval(request.interval());
        price.setIntervalCount(request.intervalCount());
        if (request.usageType() != null) {
            price.setUsageType(request.usageType());
        }
        price.setTrialPeriodDays(request.trialPeriodDays());
        price.setBillingScheme(request.billingScheme());
        price.setStripePriceId(request.stripePriceId());
        if (request.active() != null) {
            price.setActive(request.active());
        }
        return priceRepository.save(price);
    }

    public List<Price> listPrices(UUID planId) {
        return priceRepository.findByPlanId(planId);
    }

    public PlanResponse mapPlanResponse(Plan plan) {
        return billingMapper.toPlanResponse(plan);
    }

    public PriceResponse mapPriceResponse(Price price) {
        return billingMapper.toPriceResponse(price);
    }
}
