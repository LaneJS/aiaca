package com.aiaca.api.service.billing;

import com.aiaca.api.model.billing.Plan;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.enums.PlanStatus;
import com.aiaca.api.model.billing.enums.PriceInterval;
import com.aiaca.api.model.billing.enums.UsageType;
import com.aiaca.api.repository.billing.PlanRepository;
import com.aiaca.api.repository.billing.PriceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class StripePlanSyncService {

    private static final Logger logger = LoggerFactory.getLogger(StripePlanSyncService.class);

    private final PlanRepository planRepository;
    private final PriceRepository priceRepository;
    private final String planCode;
    private final String planName;
    private final String planDescription;
    private final long amount;
    private final String currency;
    private final PriceInterval interval;
    private final int intervalCount;
    private final UsageType usageType;
    private final String billingScheme;
    private final String stripePriceId;

    public StripePlanSyncService(PlanRepository planRepository,
                                 PriceRepository priceRepository,
                                 @Value("${billing.plan.code:starter}") String planCode,
                                 @Value("${billing.plan.name:AACA Pro}") String planName,
                                 @Value("${billing.plan.description:Full accessibility compliance monitoring}") String planDescription,
                                 @Value("${billing.plan.amount:3900}") long amount,
                                 @Value("${billing.plan.currency:USD}") String currency,
                                 @Value("${billing.plan.interval:MONTHLY}") PriceInterval interval,
                                 @Value("${billing.plan.interval-count:1}") int intervalCount,
                                 @Value("${billing.plan.usage-type:LICENSED}") UsageType usageType,
                                 @Value("${billing.plan.billing-scheme:per_unit}") String billingScheme,
                                 @Value("${billing.stripe.price-id:}") String stripePriceId) {
        this.planRepository = planRepository;
        this.priceRepository = priceRepository;
        this.planCode = planCode;
        this.planName = planName;
        this.planDescription = planDescription;
        this.amount = amount;
        this.currency = currency;
        this.interval = interval;
        this.intervalCount = intervalCount;
        this.usageType = usageType;
        this.billingScheme = billingScheme;
        this.stripePriceId = stripePriceId;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncStripePlan() {
        if (stripePriceId == null || stripePriceId.isBlank()) {
            logger.info("Stripe price ID not configured; skipping billing plan sync.");
            return;
        }

        if (priceRepository.findByStripePriceId(stripePriceId).isPresent()) {
            logger.info("Stripe price {} already synced to local billing plan.", stripePriceId);
            return;
        }

        Plan plan = planRepository.findByCodeIgnoreCase(planCode).orElseGet(() -> {
            Plan created = new Plan();
            created.setCode(planCode);
            created.setName(planName);
            created.setDescription(planDescription);
            created.setStatus(PlanStatus.ACTIVE);
            return planRepository.save(created);
        });

        Price price = new Price();
        price.setPlan(plan);
        price.setAmount(amount);
        price.setCurrency(currency.toUpperCase());
        price.setInterval(interval);
        price.setIntervalCount(intervalCount);
        price.setUsageType(usageType);
        price.setBillingScheme(billingScheme);
        price.setStripePriceId(stripePriceId);
        price.setActive(true);
        priceRepository.save(price);

        logger.info("Synced Stripe price {} to local plan {}", stripePriceId, plan.getCode());
    }
}
