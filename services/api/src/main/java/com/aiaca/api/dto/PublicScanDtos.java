package com.aiaca.api.dto;

import com.aiaca.api.model.IssueSeverity;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class PublicScanDtos {
    public record PublicScanRequest(@NotBlank String url) {}

    public record PublicIssue(String type, IssueSeverity severity, String description, String selector) {}

    /**
     * Response for public (free) scans.
     * @param url The scanned URL
     * @param score Accessibility score
     * @param issues List of issues (limited to top 5 for free scans)
     * @param limited Whether the results are limited (more issues exist)
     * @param totalIssues Total number of issues found (only set if limited)
     */
    public record PublicScanResponse(
            String url,
            Double score,
            List<PublicIssue> issues,
            boolean limited,
            Integer totalIssues
    ) {}
}
