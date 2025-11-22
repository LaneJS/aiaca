package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Page<Invoice> findByAccountId(UUID accountId, Pageable pageable);
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);
    Page<Invoice> findByStatusAndDueDateBefore(InvoiceStatus status, java.time.LocalDateTime dueDate, Pageable pageable);
}
