package com.aiaca.api.dto;

import java.util.List;
import java.util.UUID;

public record EmbedConfigDto(
    UUID siteId,
    String embedKey,
    List<String> autoFixes,
    boolean enableSkipLink,
    List<AltTextSuggestion> altTextSuggestions,
    String focusOutlineColor,
    String skipLinkText
) {
    public record AltTextSuggestion(
        String selector,     // CSS selector (e.g., "img.logo") - nullable
        String imageUrl,     // Full image URL for matching - nullable
        String altText       // AI-generated alt text - required
    ) {}
}
