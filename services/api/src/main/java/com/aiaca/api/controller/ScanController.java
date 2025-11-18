package com.aiaca.api.controller;

import com.aiaca.api.dto.ScanDtos;
import com.aiaca.api.model.Site;
import com.aiaca.api.model.User;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.ScanService;
import com.aiaca.api.service.SiteService;
import com.aiaca.api.service.UrlSanitizer;
import com.aiaca.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ScanController {
    private final ScanService scanService;
    private final SiteService siteService;
    private final UserRepository userRepository;
    private final UrlSanitizer urlSanitizer;

    public ScanController(ScanService scanService, SiteService siteService, UserRepository userRepository, UrlSanitizer urlSanitizer) {
        this.scanService = scanService;
        this.siteService = siteService;
        this.userRepository = userRepository;
        this.urlSanitizer = urlSanitizer;
    }

    @PostMapping("/sites/{siteId}/scans")
    public ResponseEntity<ScanDtos.ScanDetail> createScan(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable UUID siteId,
                                                          @Valid @RequestBody ScanDtos.CreateScanRequest request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        Site site = siteService.getSite(owner, siteId);
        String sanitizedUrl = urlSanitizer.sanitize(request.pageUrl());
        var scan = scanService.createScan(site, sanitizedUrl);
        return ResponseEntity.ok(scanService.toDetail(scan));
    }

    @GetMapping("/scans")
    public ResponseEntity<List<ScanDtos.ScanSummary>> listAllScans(@AuthenticationPrincipal UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        List<ScanDtos.ScanSummary> scans = scanService.listByUser(owner).stream().map(scanService::toSummary).toList();
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/sites/{siteId}/scans")
    public ResponseEntity<List<ScanDtos.ScanSummary>> listScans(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable UUID siteId) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        Site site = siteService.getSite(owner, siteId);
        List<ScanDtos.ScanSummary> scans = scanService.listBySite(site).stream().map(scanService::toSummary).toList();
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/scans/{id}")
    public ResponseEntity<ScanDtos.ScanDetail> getScan(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable UUID id) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var scan = scanService.getById(id);
        if (!scan.getSite().getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(scanService.toDetail(scan));
    }
}
