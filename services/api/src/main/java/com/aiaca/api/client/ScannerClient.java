package com.aiaca.api.client;

import com.aiaca.api.config.CorrelationIdFilter;
import com.aiaca.api.exception.UpstreamServiceException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class ScannerClient {
    private final WebClient webClient;
    private final String scannerServiceUrl;
    private final Duration timeout;

    public ScannerClient(WebClient externalWebClient,
                         @Value("${scanner.service-url}") String scannerServiceUrl,
                         @Value("${external.http.timeout-ms:8000}") long timeoutMs) {
        this.webClient = externalWebClient;
        this.scannerServiceUrl = scannerServiceUrl;
        this.timeout = Duration.ofMillis(timeoutMs);
    }

    public ScannerResponse scan(String url) {
        try {
            return webClient.post()
                    .uri(scannerServiceUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(CorrelationIdFilter.CORRELATION_HEADER, correlationId())
                    .bodyValue(Map.of("url", url))
                    .retrieve()
                    .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                            .defaultIfEmpty("scanner error")
                            .flatMap(body -> Mono.error(new UpstreamServiceException(
                                    "Scanner service error: " + body, HttpStatus.BAD_GATEWAY))))
                    .bodyToMono(ScannerResponse.class)
                    .timeout(timeout)
                    .block();
        } catch (Exception e) {
            throw new UpstreamServiceException("Failed to contact scanner service", HttpStatus.BAD_GATEWAY, e);
        }
    }

    private String correlationId() {
        String value = MDC.get("correlationId");
        return value != null ? value : "api-request";
    }

    public record ScannerIssue(String id, String type, String severity, String selector, String description, String helpUrl) {}

    public record ScannerResponse(String url, List<ScannerIssue> issues, ScannerMeta meta) {}

    public record ScannerMeta(Integer issueCount, Long rawDurationMs) {}
}
