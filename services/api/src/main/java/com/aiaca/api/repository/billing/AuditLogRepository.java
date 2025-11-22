package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.AuditLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    org.springframework.data.domain.Page<AuditLog> findByAccountId(UUID accountId, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<AuditLog> findByEntityType(String entityType, org.springframework.data.domain.Pageable pageable);
}
