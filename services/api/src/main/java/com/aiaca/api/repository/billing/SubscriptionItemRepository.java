package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.SubscriptionItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionItemRepository extends JpaRepository<SubscriptionItem, UUID> {
    List<SubscriptionItem> findBySubscriptionId(UUID subscriptionId);
}

