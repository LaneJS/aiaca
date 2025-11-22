package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.WebhookEvent;
import com.aiaca.api.model.billing.enums.WebhookEventStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {
    Page<WebhookEvent> findByStatus(WebhookEventStatus status, Pageable pageable);
    java.util.Optional<WebhookEvent> findByEventId(String eventId);
}
