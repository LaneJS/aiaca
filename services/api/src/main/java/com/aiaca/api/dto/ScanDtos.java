package com.aiaca.api.dto;

import com.aiaca.api.model.IssueSeverity;
import com.aiaca.api.model.IssueStatus;
import com.aiaca.api.model.ScanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ScanDtos {
    public record CreateScanRequest(@NotBlank String pageUrl) {}

    public record UpdateIssueStatusRequest(@NotNull IssueStatus status) {}

    public record ScanIssueDto(UUID id, String type, IssueSeverity severity, String description, String selector, String suggestion) {}

    public record IssueDetail(UUID id, String type, IssueSeverity severity, IssueStatus status, String description, String selector, String suggestion) {}

    public record ScanSummary(UUID id, LocalDateTime createdAt, ScanStatus status, Double score) {}

    public record ScanDetail(UUID id, UUID siteId, LocalDateTime createdAt, ScanStatus status, Double score, List<ScanIssueDto> issues) {}
}
