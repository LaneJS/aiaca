package com.aiaca.api.service;

import com.aiaca.api.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;

@Component
public class UrlSanitizer {
    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    public String sanitize(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("URL is required");
        }

        try {
            URI parsed = new URI(url.trim());
            if (!ALLOWED_SCHEMES.contains(parsed.getScheme())) {
                throw new BadRequestException("URL must start with http or https");
            }
            if (parsed.getHost() == null || parsed.getHost().isBlank()) {
                throw new BadRequestException("URL must include a hostname");
            }

            URI normalized = new URI(parsed.getScheme(), parsed.getUserInfo(), parsed.getHost(), parsed.getPort(),
                    parsed.getPath(), parsed.getQuery(), null);
            return normalized.toString();
        } catch (URISyntaxException e) {
            throw new BadRequestException("Invalid URL");
        }
    }
}
