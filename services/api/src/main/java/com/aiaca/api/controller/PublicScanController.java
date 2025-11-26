package com.aiaca.api.controller;

import com.aiaca.api.dto.PublicScanDtos;
import com.aiaca.api.dto.ScanDtos;
import com.aiaca.api.service.RateLimiter;
import com.aiaca.api.service.ScanService;
import com.aiaca.api.service.UrlSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class PublicScanController {
    private final ScanService scanService;
    private final RateLimiter rateLimiter;
    private final UrlSanitizer urlSanitizer;

    public PublicScanController(ScanService scanService, RateLimiter rateLimiter, UrlSanitizer urlSanitizer) {
        this.scanService = scanService;
        this.rateLimiter = rateLimiter;
        this.urlSanitizer = urlSanitizer;
    }

    private static final int FREE_SCAN_MAX_ISSUES = 5;

    @PostMapping("/scans")
    public ResponseEntity<PublicScanDtos.PublicScanResponse> createPublicScan(@Valid @RequestBody PublicScanDtos.PublicScanRequest request,
                                                                              HttpServletRequest httpRequest) {
        String key = httpRequest.getRemoteAddr();
        rateLimiter.assertWithinLimit(key);
        String sanitizedUrl = urlSanitizer.sanitize(request.url());
        ScanDtos.ScanDetail result = scanService.createPublicScan(sanitizedUrl);

        // Free scan: limit to top 5 issues, no suggestions included
        int totalIssues = result.issues().size();
        var limitedIssues = result.issues().stream()
                .limit(FREE_SCAN_MAX_ISSUES)
                // Note: Public issues don't include suggestions - that's a paid feature
                .map(issue -> new PublicScanDtos.PublicIssue(issue.type(), issue.severity(), issue.description(), issue.selector()))
                .toList();

        boolean isLimited = totalIssues > FREE_SCAN_MAX_ISSUES;
        PublicScanDtos.PublicScanResponse response = new PublicScanDtos.PublicScanResponse(
                sanitizedUrl,
                result.score(),
                limitedIssues,
                isLimited,
                isLimited ? totalIssues : null
        );
        return ResponseEntity.ok(response);
    }
}
