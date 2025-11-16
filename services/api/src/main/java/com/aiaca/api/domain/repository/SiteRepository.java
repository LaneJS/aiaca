package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.Site;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByOwnerId(UUID ownerId);
}
