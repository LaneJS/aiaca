package com.aiaca.api.jobs;

import com.aiaca.api.repository.billing.ReconciliationDriftRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(ReconciliationJob.class);
    private final ReconciliationDriftRepository reconciliationDriftRepository;

    public ReconciliationJob(ReconciliationDriftRepository reconciliationDriftRepository) {
        this.reconciliationDriftRepository = reconciliationDriftRepository;
    }

    // Nightly placeholder job to review reconciliation drifts (real Stripe sync to be added)
    @Scheduled(cron = "0 0 3 * * *")
    public void reviewDrifts() {
        long openDrifts = reconciliationDriftRepository.count();
        log.info("Reconciliation review at {} with {} open drift records", LocalDateTime.now(), openDrifts);
    }
}
