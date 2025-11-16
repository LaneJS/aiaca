package com.aiaca.api.repository;

import com.aiaca.api.model.Site;
import com.aiaca.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByOwner(User owner);
    Optional<Site> findByIdAndOwner(UUID id, User owner);
    Optional<Site> findByIdAndEmbedKey(UUID id, String embedKey);
}
