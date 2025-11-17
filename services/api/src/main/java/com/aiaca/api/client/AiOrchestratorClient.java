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
public class AiOrchestratorClient {
    private final WebClient webClient;
    private final String orchestratorUrl;
    private final Duration timeout;

    public AiOrchestratorClient(WebClient externalWebClient,
                                @Value("${ai-orchestrator.service-url}") String orchestratorUrl,
                                @Value("${external.http.timeout-ms:8000}") long timeoutMs) {
        this.webClient = externalWebClient;
        this.orchestratorUrl = orchestratorUrl;
        this.timeout = Duration.ofMillis(timeoutMs);
    }

    public SuggestionResponse requestSuggestions(String pageUrl, List<IssueContext> issues, boolean useStub) {
        try {
            return webClient.post()
                    .uri(orchestratorUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(CorrelationIdFilter.CORRELATION_HEADER, correlationId())
                    .bodyValue(Map.of(
                            "pageUrl", pageUrl,
                            "issues", issues,
                            "useStub", useStub
                    ))
                    .retrieve()
                    .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                            .defaultIfEmpty("ai orchestrator error")
                            .flatMap(body -> Mono.error(new UpstreamServiceException(
                                    "AI orchestrator error: " + body, HttpStatus.BAD_GATEWAY))))
                    .bodyToMono(SuggestionResponse.class)
                    .timeout(timeout)
                    .block();
        } catch (Exception e) {
            throw new UpstreamServiceException("Failed to contact AI orchestrator", HttpStatus.BAD_GATEWAY, e);
        }
    }

    private String correlationId() {
        String value = MDC.get("correlationId");
        return value != null ? value : "api-request";
    }

    public record IssueContext(String id, String type, String severity, String description, String selector, String pageUrl) {}

    public record SuggestionResponse(String provider, String requestId, List<SuggestedFix> suggestions) {}

    public record SuggestedFix(String issueId, String selector, String explanation, String suggestedFix, Double confidence,
                               Boolean grounded) {}
}
