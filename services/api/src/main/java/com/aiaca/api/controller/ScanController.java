package com.aiaca.api.controller;

import com.aiaca.api.dto.ScanDtos;
import com.aiaca.api.model.Site;
import com.aiaca.api.model.User;
import com.aiaca.api.security.RequiresSubscription;
import com.aiaca.api.security.UserPrincipal;
import com.aiaca.api.service.ScanService;
import com.aiaca.api.service.SiteService;
import com.aiaca.api.service.UrlSanitizer;
import com.aiaca.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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
    @RequiresSubscription
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
    @RequiresSubscription(allowPastDueReads = true)
    public ResponseEntity<List<ScanDtos.ScanSummary>> listAllScans(@AuthenticationPrincipal UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        List<ScanDtos.ScanSummary> scans = scanService.listByUser(owner).stream().map(scanService::toSummary).toList();
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/sites/{siteId}/scans")
    @RequiresSubscription(allowPastDueReads = true)
    public ResponseEntity<List<ScanDtos.ScanSummary>> listScans(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable UUID siteId) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        Site site = siteService.getSite(owner, siteId);
        List<ScanDtos.ScanSummary> scans = scanService.listBySite(site).stream().map(scanService::toSummary).toList();
        return ResponseEntity.ok(scans);
    }

    @GetMapping("/scans/{id}")
    @RequiresSubscription(allowPastDueReads = true)
    public ResponseEntity<ScanDtos.ScanDetail> getScan(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable UUID id) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var scan = scanService.getById(id);
        if (!scan.getSite().getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(scanService.getDetailById(id));
    }

    @GetMapping("/scans/{id}/export")
    @RequiresSubscription
    public ResponseEntity<byte[]> exportScan(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable UUID id,
                                             @RequestParam(name = "format", defaultValue = "pdf") String format) {
        if (!format.equalsIgnoreCase("pdf") && !format.equalsIgnoreCase("html")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(("Unsupported format: " + format).getBytes());
        }
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var scan = scanService.getById(id);
        if (!scan.getSite().getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // Placeholder implementation to keep API stable; replace with real report generation.
        String body = "Report generation is not enabled yet.";
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=scan-" + id + "." + format.toLowerCase());
        headers.add(HttpHeaders.CONTENT_TYPE, format.equalsIgnoreCase("pdf") ? "application/pdf" : "text/html");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).headers(headers).body(body.getBytes());
    }

    @PostMapping("/scans/{id}/share")
    @RequiresSubscription
    public ResponseEntity<ScanDtos.ShareLinkResponse> createShareLink(@AuthenticationPrincipal UserPrincipal principal,
                                                                      @PathVariable UUID id) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var scan = scanService.getById(id);
        if (!scan.getSite().getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // Placeholder share link; replace with signed token-based links when feature is implemented.
        String link = "/share/scan/" + id;
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(new ScanDtos.ShareLinkResponse(link, null));
    }

    @PatchMapping("/scans/{scanId}/issues/{issueId}")
    @RequiresSubscription
    public ResponseEntity<ScanDtos.IssueDetail> updateIssueStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @PathVariable UUID scanId,
                                                                  @PathVariable UUID issueId,
                                                                  @Valid @RequestBody ScanDtos.UpdateIssueStatusRequest request) {
        User owner = userRepository.findById(principal.getId()).orElseThrow();
        var issue = scanService.updateIssueStatus(scanId, issueId, request.status(), owner);
        return ResponseEntity.ok(scanService.toIssueDetail(issue));
    }
}
