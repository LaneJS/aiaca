package com.aiaca.api.service;

import com.aiaca.api.client.AiOrchestratorClient;
import com.aiaca.api.client.ScannerClient;
import com.aiaca.api.dto.ScanDtos;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.exception.UpstreamServiceException;
import com.aiaca.api.model.AiSuggestion;
import com.aiaca.api.model.IssueSeverity;
import com.aiaca.api.model.Scan;
import com.aiaca.api.model.ScanIssue;
import com.aiaca.api.model.ScanStatus;
import com.aiaca.api.model.Site;
import com.aiaca.api.repository.ScanRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ScanService {
    private static final Logger log = LoggerFactory.getLogger(ScanService.class);

    private final ScanRepository scanRepository;
    private final ScannerClient scannerClient;
    private final AiOrchestratorClient aiOrchestratorClient;
    private final boolean aiUseStub;
    private final Counter scanCounter;
    private final Counter publicScanCounter;
    private final Timer scanTimer;

    public ScanService(ScanRepository scanRepository,
                       MeterRegistry meterRegistry,
                       ScannerClient scannerClient,
                       AiOrchestratorClient aiOrchestratorClient,
                       @Value("${ai-orchestrator.use-stub:false}") boolean aiUseStub) {
        this.scanRepository = scanRepository;
        this.scannerClient = scannerClient;
        this.aiOrchestratorClient = aiOrchestratorClient;
        this.aiUseStub = aiUseStub;
        this.scanCounter = meterRegistry.counter("api_scans_total", "type", "authenticated");
        this.publicScanCounter = meterRegistry.counter("api_scans_total", "type", "public");
        this.scanTimer = meterRegistry.timer("api_scan_duration_seconds");
    }

    public Scan createScan(Site site, String sanitizedUrl) {
        Timer.Sample sample = Timer.start();
        Scan scan = new Scan();
        scan.setSite(site);
        scan.setStatus(ScanStatus.QUEUED);
        scanRepository.save(scan);

        try {
            ScannerClient.ScannerResponse scannerResponse = scannerClient.scan(sanitizedUrl);
            populateScanFromScanner(scan, scannerResponse, true);
            Scan saved = scanRepository.save(scan);
            scanCounter.increment();
            return saved;
        } catch (UpstreamServiceException ex) {
            scan.setStatus(ScanStatus.FAILED);
            scanRepository.save(scan);
            throw ex;
        } finally {
            sample.stop(scanTimer);
        }
    }

    private void populateScanFromScanner(Scan scan, ScannerClient.ScannerResponse scannerResponse, boolean fetchSuggestions) {
        scan.setStatus(ScanStatus.COMPLETED);
        scan.setScore(calculateScore(scannerResponse.issues()));
        scan.getIssues().clear();

        Map<String, ScanIssue> scannerIssueMap = new HashMap<>();
        for (ScannerClient.ScannerIssue scannerIssue : scannerResponse.issues()) {
            ScanIssue issue = new ScanIssue();
            issue.setScan(scan);
            issue.setType(scannerIssue.type());
            issue.setSeverity(mapSeverity(scannerIssue.severity()));
            issue.setDescription(scannerIssue.description());
            issue.setSelector(scannerIssue.selector());
            scan.getIssues().add(issue);
            if (scannerIssue.id() != null) {
                scannerIssueMap.put(scannerIssue.id(), issue);
            }
        }

        if (fetchSuggestions && !scan.getIssues().isEmpty()) {
            Map<String, List<AiOrchestratorClient.SuggestedFix>> suggestions = fetchSuggestions(scannerResponse);
            suggestions.forEach((issueId, suggestedFixes) -> {
                ScanIssue issue = scannerIssueMap.get(issueId);
                if (issue == null) {
                    issue = scan.getIssues().stream().findFirst().orElse(null);
                }
                if (issue != null) {
                    for (AiOrchestratorClient.SuggestedFix fix : suggestedFixes) {
                        AiSuggestion suggestion = new AiSuggestion();
                        suggestion.setScanIssue(issue);
                        suggestion.setSuggestion(fix.suggestedFix());
                        suggestion.setRationale(fix.explanation());
                        issue.getAiSuggestions().add(suggestion);
                        if (issue.getSuggestion() == null) {
                            issue.setSuggestion(fix.suggestedFix());
                        }
                    }
                }
            });
        }
    }

    private Map<String, List<AiOrchestratorClient.SuggestedFix>> fetchSuggestions(
            ScannerClient.ScannerResponse scannerResponse) {
        try {
            List<AiOrchestratorClient.IssueContext> contexts = scannerResponse.issues().stream()
                    .map(issue -> new AiOrchestratorClient.IssueContext(
                            issue.id(), issue.type(), issue.severity(), issue.description(), issue.selector(),
                            scannerResponse.url()))
                    .toList();

            AiOrchestratorClient.SuggestionResponse suggestionResponse =
                    aiOrchestratorClient.requestSuggestions(scannerResponse.url(), contexts, aiUseStub);
            if (suggestionResponse == null || suggestionResponse.suggestions() == null) {
                return Map.of();
            }

            return suggestionResponse.suggestions().stream()
                    .collect(Collectors.groupingBy(AiOrchestratorClient.SuggestedFix::issueId));
        } catch (UpstreamServiceException ex) {
            log.warn("AI orchestrator unavailable for scan {}: {}", scannerResponse.url(), ex.getMessage());
            return Map.of();
        }
    }

    private IssueSeverity mapSeverity(String severity) {
        if (severity == null) {
            return IssueSeverity.WARNING;
        }
        return "error".equalsIgnoreCase(severity) ? IssueSeverity.ERROR : IssueSeverity.WARNING;
    }

    private double calculateScore(List<ScannerClient.ScannerIssue> issues) {
        int issueCount = issues == null ? 0 : issues.size();
        return Math.max(0, 100 - issueCount * 5);
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
                        issue.getDescription(), issue.getSelector(), resolveSuggestion(issue)))
                .toList();
        return new ScanDtos.ScanDetail(scan.getId(), scan.getSite() != null ? scan.getSite().getId() : null,
                scan.getCreatedAt(), scan.getStatus(), scan.getScore(), issueDtos);
    }

    private String resolveSuggestion(ScanIssue issue) {
        if (issue.getSuggestion() != null) {
            return issue.getSuggestion();
        }
        return issue.getAiSuggestions().stream().findFirst().map(AiSuggestion::getSuggestion).orElse(null);
    }

    private String firstSuggestion(List<AiOrchestratorClient.SuggestedFix> fixes) {
        if (fixes == null || fixes.isEmpty()) {
            return null;
        }
        return fixes.get(0).suggestedFix();
    }

    public ScanDtos.ScanDetail createPublicScan(String url) {
        Timer.Sample sample = Timer.start();
        try {
            ScannerClient.ScannerResponse scannerResponse = scannerClient.scan(url);
            Map<String, List<AiOrchestratorClient.SuggestedFix>> suggestions = fetchSuggestions(scannerResponse);

            List<ScanDtos.ScanIssueDto> issueDtos = scannerResponse.issues().stream()
                    .map(issue -> new ScanDtos.ScanIssueDto(null, issue.type(), mapSeverity(issue.severity()),
                            issue.description(), issue.selector(),
                            firstSuggestion(suggestions.get(issue.id()))))
                    .toList();

            publicScanCounter.increment();
            return new ScanDtos.ScanDetail(null, null, LocalDateTime.now(), ScanStatus.COMPLETED,
                    calculateScore(scannerResponse.issues()), issueDtos);
        } finally {
            sample.stop(scanTimer);
        }
    }
}
