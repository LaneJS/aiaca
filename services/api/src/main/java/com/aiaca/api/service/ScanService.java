package com.aiaca.api.service;

import com.aiaca.api.dto.ScanDtos;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.IssueSeverity;
import com.aiaca.api.model.Scan;
import com.aiaca.api.model.ScanIssue;
import com.aiaca.api.model.ScanStatus;
import com.aiaca.api.model.Site;
import com.aiaca.api.repository.ScanRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ScanService {
    private final ScanRepository scanRepository;
    private final Counter scanCounter;
    private final Counter publicScanCounter;
    private final Timer scanTimer;

    public ScanService(ScanRepository scanRepository, MeterRegistry meterRegistry) {
        this.scanRepository = scanRepository;
        this.scanCounter = meterRegistry.counter("api_scans_total", "type", "authenticated");
        this.publicScanCounter = meterRegistry.counter("api_scans_total", "type", "public");
        this.scanTimer = meterRegistry.timer("api_scan_duration_seconds");
    }

    public Scan createScan(Site site, ScanDtos.CreateScanRequest request) {
        Timer.Sample sample = Timer.start();
        Scan scan = new Scan();
        scan.setSite(site);
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setScore(82.0);

        ScanIssue issue = new ScanIssue();
        issue.setScan(scan);
        issue.setType("alt_missing");
        issue.setSeverity(IssueSeverity.ERROR);
        issue.setDescription("Image is missing alternative text");
        issue.setSelector("img.hero");
        issue.setSuggestion("Add descriptive alt text to hero image");
        scan.getIssues().add(issue);

        Scan saved = scanRepository.save(scan);
        scanCounter.increment();
        sample.stop(scanTimer);
        return saved;
    }

    public List<Scan> listBySite(Site site) {
        return scanRepository.findBySite(site);
    }

    public Scan getById(UUID id) {
        return scanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found"));
    }

    public Scan getByIdForSite(UUID scanId, Site site) {
        return scanRepository.findByIdAndSite(scanId, site)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found for site"));
    }

    public ScanDtos.ScanSummary toSummary(Scan scan) {
        return new ScanDtos.ScanSummary(scan.getId(), scan.getCreatedAt(), scan.getStatus(), scan.getScore());
    }

    public ScanDtos.ScanDetail toDetail(Scan scan) {
        List<ScanDtos.ScanIssueDto> issueDtos = scan.getIssues().stream()
                .map(issue -> new ScanDtos.ScanIssueDto(issue.getId(), issue.getType(), issue.getSeverity(),
                        issue.getDescription(), issue.getSelector(), issue.getSuggestion()))
                .toList();
        return new ScanDtos.ScanDetail(scan.getId(), scan.getSite().getId(), scan.getCreatedAt(),
                scan.getStatus(), scan.getScore(), issueDtos);
    }

    public ScanDtos.ScanDetail createPublicScan(String url) {
        Timer.Sample sample = Timer.start();
        Scan scan = new Scan();
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setScore(70.0);
        scan.setCreatedAt(LocalDateTime.now());

        ScanIssue issue = new ScanIssue();
        issue.setType("heading_structure");
        issue.setSeverity(IssueSeverity.WARNING);
        issue.setDescription("Heading levels should be nested sequentially");
        issue.setSelector("h3.section-title");
        scan.setIssues(List.of(issue));

        List<ScanDtos.ScanIssueDto> issueDtos = List.of(
                new ScanDtos.ScanIssueDto(null, issue.getType(), issue.getSeverity(), issue.getDescription(), issue.getSelector(), null));
        publicScanCounter.increment();
        sample.stop(scanTimer);
        return new ScanDtos.ScanDetail(null, null, scan.getCreatedAt(), scan.getStatus(), scan.getScore(), issueDtos);
    }
}
