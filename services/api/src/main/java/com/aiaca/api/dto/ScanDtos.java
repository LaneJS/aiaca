package com.aiaca.api.dto;

import com.aiaca.api.model.IssueSeverity;
import com.aiaca.api.model.ScanStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ScanDtos {
    public record CreateScanRequest(@NotBlank String pageUrl) {}

    public record ScanIssueDto(UUID id, String type, IssueSeverity severity, String description, String selector, String suggestion) {}

    public record ScanSummary(UUID id, LocalDateTime createdAt, ScanStatus status, Double score) {}

    public record ScanDetail(UUID id, UUID siteId, LocalDateTime createdAt, ScanStatus status, Double score, List<ScanIssueDto> issues) {}
}
