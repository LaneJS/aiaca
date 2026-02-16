package com.aiaca.api.controller;

import com.aiaca.api.dto.SiteDtos;
import com.aiaca.api.model.User;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.SiteService;
import com.aiaca.api.service.SiteSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sites/{siteId}")
@PreAuthorize("!hasAnyRole('ADMIN','OPERATOR','VIEWER')")
public class SiteSettingsController {
    private final SiteService siteService;
    private final SiteSettingsService siteSettingsService;
    private final UserRepository userRepository;

    public SiteSettingsController(SiteService siteService, SiteSettingsService siteSettingsService, UserRepository userRepository) {
        this.siteService = siteService;
        this.siteSettingsService = siteSettingsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/schedule")
    public ResponseEntity<SiteDtos.SiteScheduleDto> getSchedule(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable UUID siteId) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.getSite(owner, siteId);
        return ResponseEntity.ok(siteSettingsService.getSchedule(site));
    }

    @PutMapping("/schedule")
    public ResponseEntity<SiteDtos.SiteScheduleDto> updateSchedule(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable UUID siteId,
                                                                   @Valid @RequestBody SiteDtos.SiteScheduleDto request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.getSite(owner, siteId);
        return ResponseEntity.ok(siteSettingsService.updateSchedule(site, request));
    }

    @GetMapping("/notifications")
    public ResponseEntity<SiteDtos.NotificationSettingsDto> getNotifications(@AuthenticationPrincipal UserPrincipal principal,
                                                                             @PathVariable UUID siteId) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.getSite(owner, siteId);
        return ResponseEntity.ok(siteSettingsService.getNotifications(site));
    }

    @PutMapping("/notifications")
    public ResponseEntity<SiteDtos.NotificationSettingsDto> updateNotifications(@AuthenticationPrincipal UserPrincipal principal,
                                                                                @PathVariable UUID siteId,
                                                                                @Valid @RequestBody SiteDtos.NotificationSettingsDto request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.getSite(owner, siteId);
        return ResponseEntity.ok(siteSettingsService.updateNotifications(site, request));
    }
}
