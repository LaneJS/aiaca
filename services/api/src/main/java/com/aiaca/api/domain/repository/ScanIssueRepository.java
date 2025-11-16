package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.ScanIssue;
import com.aiaca.api.domain.model.enums.IssueSeverity;
import com.aiaca.api.domain.model.enums.IssueStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScanIssueRepository extends JpaRepository<ScanIssue, UUID> {
    List<ScanIssue> findByScanId(UUID scanId);

    List<ScanIssue> findBySeverity(IssueSeverity severity);

    List<ScanIssue> findByStatus(IssueStatus status);
}
