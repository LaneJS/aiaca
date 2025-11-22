package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Price;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRepository extends JpaRepository<Price, UUID> {
    List<Price> findByPlanId(UUID planId);
}

