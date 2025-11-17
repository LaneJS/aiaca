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

    @PostMapping("/scans")
    public ResponseEntity<PublicScanDtos.PublicScanResponse> createPublicScan(@Valid @RequestBody PublicScanDtos.PublicScanRequest request,
                                                                              HttpServletRequest httpRequest) {
        String key = httpRequest.getRemoteAddr();
        rateLimiter.assertWithinLimit(key);
        String sanitizedUrl = urlSanitizer.sanitize(request.url());
        ScanDtos.ScanDetail result = scanService.createPublicScan(sanitizedUrl);
        var issues = result.issues().stream()
                .map(issue -> new PublicScanDtos.PublicIssue(issue.type(), issue.severity(), issue.description(), issue.selector()))
                .toList();
        PublicScanDtos.PublicScanResponse response = new PublicScanDtos.PublicScanResponse(sanitizedUrl, result.score(), issues);
        return ResponseEntity.ok(response);
    }
}
