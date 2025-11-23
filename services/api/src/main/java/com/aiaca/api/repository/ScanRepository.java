package com.aiaca.api.repository;

import com.aiaca.api.model.Scan;
import com.aiaca.api.model.ScanStatus;
import com.aiaca.api.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScanRepository extends JpaRepository<Scan, UUID> {
    List<Scan> findBySite(Site site);
    Optional<Scan> findByIdAndSite(UUID id, Site site);
    Optional<Scan> findFirstBySiteAndStatusOrderByCreatedAtDesc(Site site, ScanStatus status);

    @Query("SELECT DISTINCT s FROM Scan s " +
           "LEFT JOIN FETCH s.issues " +
           "WHERE s.id = :id")
    Optional<Scan> findByIdWithIssues(@Param("id") UUID id);

    @Query("SELECT DISTINCT s FROM Scan s " +
           "LEFT JOIN FETCH s.issues " +
           "WHERE s.site = :site")
    List<Scan> findBySiteWithIssues(@Param("site") Site site);

    @Query("SELECT DISTINCT s FROM Scan s " +
           "LEFT JOIN FETCH s.issues " +
           "WHERE s.id = :id AND s.site = :site")
    Optional<Scan> findByIdAndSiteWithIssues(@Param("id") UUID id, @Param("site") Site site);
}
