package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Plan;
import com.aiaca.api.model.billing.enums.PlanStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, UUID> {
    Optional<Plan> findByCodeIgnoreCase(String code);
    Page<Plan> findByStatus(PlanStatus status, Pageable pageable);
}

