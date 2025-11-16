package com.aiaca.api.repository;

import com.aiaca.api.model.Scan;
import com.aiaca.api.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScanRepository extends JpaRepository<Scan, UUID> {
    List<Scan> findBySite(Site site);
    Optional<Scan> findByIdAndSite(UUID id, Site site);
}
