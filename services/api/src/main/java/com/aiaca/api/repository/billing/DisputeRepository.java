package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Dispute;
import com.aiaca.api.model.billing.enums.DisputeStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);
}

