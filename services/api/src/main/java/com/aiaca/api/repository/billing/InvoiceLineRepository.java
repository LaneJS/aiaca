package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.InvoiceLine;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceLineRepository extends JpaRepository<InvoiceLine, UUID> {
    java.util.List<InvoiceLine> findByInvoiceId(UUID invoiceId);
}
