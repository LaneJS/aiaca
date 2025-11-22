package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Refund;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundRepository extends JpaRepository<Refund, UUID> {
}

