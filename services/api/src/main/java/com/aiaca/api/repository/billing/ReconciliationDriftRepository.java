package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.ReconciliationDrift;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReconciliationDriftRepository extends JpaRepository<ReconciliationDrift, UUID> {
}

