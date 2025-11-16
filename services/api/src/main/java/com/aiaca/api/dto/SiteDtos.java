package com.aiaca.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

public class SiteDtos {
    public record CreateSiteRequest(@NotBlank String name, @NotBlank String url) {}

    public record SiteResponse(UUID id, String name, String url, String embedKey, LocalDateTime createdAt) {}
}
