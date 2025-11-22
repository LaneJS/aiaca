package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.CreateSubscriptionRequest;
import com.aiaca.api.dto.billing.BillingDtos.SubscriptionItemRequest;
import com.aiaca.api.dto.billing.BillingDtos.UpdateSubscriptionStatusRequest;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.Coupon;
import com.aiaca.api.model.billing.Price;
import com.aiaca.api.model.billing.Subscription;
import com.aiaca.api.model.billing.SubscriptionItem;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.CouponRepository;
import com.aiaca.api.repository.billing.PriceRepository;
import com.aiaca.api.repository.billing.SubscriptionItemRepository;
import com.aiaca.api.repository.billing.SubscriptionRepository;
import com.aiaca.api.util.JsonHelper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionItemRepository subscriptionItemRepository;
    private final AccountRepository accountRepository;
    private final PriceRepository priceRepository;
    private final CouponRepository couponRepository;
    private final JsonHelper jsonHelper;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               SubscriptionItemRepository subscriptionItemRepository,
                               AccountRepository accountRepository,
                               PriceRepository priceRepository,
                               CouponRepository couponRepository,
                               JsonHelper jsonHelper) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionItemRepository = subscriptionItemRepository;
        this.accountRepository = accountRepository;
        this.priceRepository = priceRepository;
        this.couponRepository = couponRepository;
        this.jsonHelper = jsonHelper;
    }

    public Page<Subscription> listSubscriptions(UUID accountId, SubscriptionStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (accountId != null) {
            return subscriptionRepository.findByAccountId(accountId, pageable);
        }
        if (status != null) {
            return subscriptionRepository.findByStatus(status, pageable);
        }
        return subscriptionRepository.findAll(pageable);
    }

    public Subscription getSubscription(UUID id) {
        return subscriptionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }

    @Transactional
    public Subscription createSubscription(CreateSubscriptionRequest request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Subscription subscription = new Subscription();
        subscription.setAccount(account);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCurrency(request.currency());
        subscription.setCollectionMethod(request.collectionMethod());
        if (request.couponId() != null) {
            Coupon coupon = couponRepository.findById(request.couponId())
                    .orElseThrow(() -> new BadRequestException("Coupon not found"));
            subscription.setCoupon(coupon);
        }
        subscription.setStartDate(request.startDate() != null ? request.startDate() : LocalDateTime.now());
        subscription.setTrialEnd(request.trialEnd());
        subscription.setMetadata(jsonHelper.toJson(request.metadata()));
        Subscription saved = subscriptionRepository.save(subscription);

        if (request.items() != null) {
            for (SubscriptionItemRequest itemRequest : request.items()) {
                addSubscriptionItem(saved, itemRequest);
            }
        }
        return saved;
    }

    @Transactional
    public Subscription updateStatus(UUID subscriptionId, UpdateSubscriptionStatusRequest request) {
        Subscription subscription = getSubscription(subscriptionId);
        subscription.setStatus(request.status());
        subscription.setCancelAt(request.cancelAt());
        if (request.status() == SubscriptionStatus.CANCELED) {
            subscription.setCanceledAt(LocalDateTime.now());
        }
        if (request.status() == SubscriptionStatus.PAUSED) {
            subscription.setEndedAt(LocalDateTime.now());
        }
        return subscriptionRepository.save(subscription);
    }

    public List<SubscriptionItem> getItems(UUID subscriptionId) {
        return subscriptionItemRepository.findBySubscriptionId(subscriptionId);
    }

    private SubscriptionItem addSubscriptionItem(Subscription subscription, SubscriptionItemRequest itemRequest) {
        Price price = priceRepository.findById(itemRequest.priceId())
                .orElseThrow(() -> new BadRequestException("Price not found"));
        SubscriptionItem item = new SubscriptionItem();
        item.setSubscription(subscription);
        item.setPrice(price);
        item.setQuantity(itemRequest.quantity());
        return subscriptionItemRepository.save(item);
    }
}
