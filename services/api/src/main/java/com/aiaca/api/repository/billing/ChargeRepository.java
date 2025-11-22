package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Charge;
import com.aiaca.api.model.billing.enums.ChargeStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargeRepository extends JpaRepository<Charge, UUID> {
    Page<Charge> findByAccountId(UUID accountId, Pageable pageable);
    Page<Charge> findByStatus(ChargeStatus status, Pageable pageable);
}

