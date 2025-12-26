package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Subscription;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Page<Subscription> findByAccountId(UUID accountId, Pageable pageable);
    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
