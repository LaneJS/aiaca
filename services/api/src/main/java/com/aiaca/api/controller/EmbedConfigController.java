package com.aiaca.api.controller;

import com.aiaca.api.dto.EmbedConfigDto;
import com.aiaca.api.model.User;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.SiteService;
import com.aiaca.api.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sites")
@PreAuthorize("!hasAnyRole('ADMIN','OPERATOR','VIEWER')")
public class EmbedConfigController {
    private final SiteService siteService;
    private final UserRepository userRepository;

    public EmbedConfigController(SiteService siteService, UserRepository userRepository) {
        this.siteService = siteService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}/embed-config")
    public ResponseEntity<EmbedConfigDto> getEmbedConfig(@PathVariable UUID id,
                                                         @RequestHeader(value = "X-Embed-Key", required = false) String embedKey,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        if (embedKey != null) {
            var site = siteService.getByEmbedKey(id, embedKey);
            return ResponseEntity.ok(siteService.toEmbedConfig(site));
        }
        if (principal != null) {
            User owner = userRepository.findById(principal.getId()).orElseThrow();
            var site = siteService.getSite(owner, id);
            return ResponseEntity.ok(siteService.toEmbedConfig(site));
        }
        return ResponseEntity.status(401).header(HttpHeaders.WWW_AUTHENTICATE, "Bearer").build();
    }
}
