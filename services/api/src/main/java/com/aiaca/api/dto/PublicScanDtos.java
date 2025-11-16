package com.aiaca.api.dto;

import com.aiaca.api.model.IssueSeverity;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class PublicScanDtos {
    public record PublicScanRequest(@NotBlank String url) {}

    public record PublicIssue(String type, IssueSeverity severity, String description, String selector) {}

    public record PublicScanResponse(String url, Double score, List<PublicIssue> issues) {}
}
