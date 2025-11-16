package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.Scan;
import com.aiaca.api.domain.model.enums.ScanStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScanRepository extends JpaRepository<Scan, UUID> {
    List<Scan> findBySiteId(UUID siteId);

    List<Scan> findByStatus(ScanStatus status);
}
