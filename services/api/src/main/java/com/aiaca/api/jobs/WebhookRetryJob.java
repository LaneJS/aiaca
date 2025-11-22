package com.aiaca.api.jobs;

import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import com.aiaca.api.repository.billing.WebhookEventRepository;
import com.aiaca.api.service.billing.WebhookService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WebhookRetryJob {

    private static final Logger log = LoggerFactory.getLogger(WebhookRetryJob.class);

    private final WebhookEventRepository webhookEventRepository;
    private final WebhookService webhookService;

    public WebhookRetryJob(WebhookEventRepository webhookEventRepository, WebhookService webhookService) {
        this.webhookEventRepository = webhookEventRepository;
        this.webhookService = webhookService;
    }

    // Retry failed webhook processing every 10 minutes (placeholder; real reprocessing logic should be added)
    @Scheduled(cron = "0 */10 * * * *")
    public void retryFailedWebhooks() {
        List<WebhookEvent> failed = webhookEventRepository.findAll().stream()
                .filter(event -> event.getStatus() == WebhookEventStatus.FAILED || event.getStatus() == WebhookEventStatus.RETRYING)
                .toList();
        failed.forEach(event -> {
            webhookService.markStatus(event.getId(), WebhookEventStatus.RETRYING, event.getLastError());
            log.warn("Marked webhook {} for retry (type={}, lastError={})", event.getEventId(), event.getEventType(), event.getLastError());
        });
    }
}
