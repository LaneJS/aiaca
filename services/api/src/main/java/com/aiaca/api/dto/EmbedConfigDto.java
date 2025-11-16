package com.aiaca.api.dto;

import java.util.List;
import java.util.UUID;

public record EmbedConfigDto(UUID siteId, String embedKey, List<String> autoFixes, boolean enableSkipLink) {}
