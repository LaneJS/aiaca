package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.DunningEvent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DunningEventRepository extends JpaRepository<DunningEvent, UUID> {
    java.util.List<DunningEvent> findByInvoiceId(UUID invoiceId);
}
