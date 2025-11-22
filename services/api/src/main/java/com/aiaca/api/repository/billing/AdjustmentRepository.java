package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Adjustment;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdjustmentRepository extends JpaRepository<Adjustment, UUID> {
}

