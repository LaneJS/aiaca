package com.aiaca.api.jobs;

import com.aiaca.api.model.billing.Invoice;
import com.aiaca.api.model.billing.enums.DunningEventStatus;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
import com.aiaca.api.repository.billing.DunningEventRepository;
import com.aiaca.api.repository.billing.InvoiceRepository;
import com.aiaca.api.service.billing.DunningService;
import java.time.LocalDateTime;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DunningJob {
    private static final Logger log = LoggerFactory.getLogger(DunningJob.class);

    private final InvoiceRepository invoiceRepository;
    private final DunningEventRepository dunningEventRepository;
    private final DunningService dunningService;

    public DunningJob(InvoiceRepository invoiceRepository,
                      DunningEventRepository dunningEventRepository,
                      DunningService dunningService) {
        this.invoiceRepository = invoiceRepository;
        this.dunningEventRepository = dunningEventRepository;
        this.dunningService = dunningService;
    }

    // Check hourly for past-due invoices and log a dunning event (placeholder for retry/reminder logic)
    @Scheduled(cron = "0 0 * * * *")
    public void enqueuePastDueInvoices() {
        Set<InvoiceStatus> targetStatuses = Set.of(InvoiceStatus.OPEN, InvoiceStatus.PAST_DUE);
        LocalDateTime now = LocalDateTime.now();
        targetStatuses.forEach(status -> invoiceRepository.findByStatusAndDueDateBefore(status, now, org.springframework.data.domain.PageRequest.of(0, 200))
                .forEach(invoice -> {
                    boolean alreadyLogged = dunningEventRepository.findByInvoiceId(invoice.getId()).stream()
                            .anyMatch(event -> event.getStatus() == DunningEventStatus.PENDING || event.getStatus() == DunningEventStatus.RETRY_SCHEDULED);
                    if (!alreadyLogged) {
                        dunningService.recordEvent(invoice.getAccount().getId(), invoice.getId(), null, "auto-detect-past-due", "system", DunningEventStatus.PENDING, null);
                        log.info("Queued dunning event for invoice {}", invoice.getId());
                    }
                }));
    }
}
