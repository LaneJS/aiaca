package com.aiaca.api.repository;

import com.aiaca.api.model.ScanIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ScanIssueRepository extends JpaRepository<ScanIssue, UUID> {
}
