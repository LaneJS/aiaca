package com.aiaca.api.controller;

import com.aiaca.api.dto.SiteDtos;
import com.aiaca.api.model.User;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.SiteService;
import com.aiaca.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sites")
public class SiteController {
    private final SiteService siteService;
    private final UserRepository userRepository;

    public SiteController(SiteService siteService, UserRepository userRepository) {
        this.siteService = siteService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<SiteDtos.SiteResponse> createSite(@AuthenticationPrincipal UserPrincipal principal,
                                                            @Valid @RequestBody SiteDtos.CreateSiteRequest request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.createSite(owner, request);
        return ResponseEntity.ok(siteService.toResponse(site));
    }

    @GetMapping
    public ResponseEntity<List<SiteDtos.SiteResponse>> listSites(@AuthenticationPrincipal UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        List<SiteDtos.SiteResponse> sites = siteService.listSites(owner).stream().map(siteService::toResponse).toList();
        return ResponseEntity.ok(sites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteDtos.SiteResponse> getSite(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable UUID id) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.getSite(owner, id);
        return ResponseEntity.ok(siteService.toResponse(site));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SiteDtos.SiteResponse> updateSite(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable UUID id,
                                                            @Valid @RequestBody SiteDtos.UpdateSiteRequest request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var site = siteService.updateSite(owner, id, request);
        return ResponseEntity.ok(siteService.toResponse(site));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable UUID id) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        siteService.deleteSite(owner, id);
        return ResponseEntity.noContent().build();
    }
}
