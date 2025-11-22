package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.DunningEventResponse;
import com.aiaca.api.dto.billing.BillingDtos.DunningScheduleResponse;
import com.aiaca.api.dto.billing.BillingDtos.InvoiceResponse;
import com.aiaca.api.model.billing.DunningEvent;
import com.aiaca.api.model.billing.DunningSchedule;
import com.aiaca.api.model.billing.enums.DunningEventStatus;
import com.aiaca.api.service.billing.BillingMapper;
import com.aiaca.api.service.billing.DunningService;
import com.aiaca.api.service.billing.IdempotencyService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/dunning")
public class DunningController {

    private final DunningService dunningService;
    private final IdempotencyService idempotencyService;
    private final BillingMapper billingMapper;

    public DunningController(DunningService dunningService, IdempotencyService idempotencyService, BillingMapper billingMapper) {
        this.dunningService = dunningService;
        this.idempotencyService = idempotencyService;
        this.billingMapper = billingMapper;
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<DunningEventResponse> listEvents() {
        return dunningService.listEvents().stream()
                .map(this::toEventResponse)
                .toList();
    }

    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<DunningScheduleResponse> listSchedules() {
        return dunningService.listSchedules().stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public List<InvoiceResponse> listPastDueQueue() {
        return dunningService.listPastDueInvoices().stream()
                .map(inv -> billingMapper.toInvoiceResponse(inv, java.util.Collections.emptyList()))
                .toList();
    }

    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<DunningEventResponse> recordEvent(@RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
                                                            @RequestParam UUID accountId,
                                                            @RequestParam(required = false) UUID invoiceId,
                                                            @RequestParam(required = false) UUID scheduleId,
                                                            @RequestParam(required = false) String stepName,
                                                            @RequestParam(required = false) String channel,
                                                            @RequestParam DunningEventStatus status,
                                                            @RequestParam(required = false) String errorMessage) {
        idempotencyService.assertOrRecord(null, idempotencyKey, null, null, "DUNNING_EVENT", accountId.toString());
        DunningEvent event = dunningService.recordEvent(accountId, invoiceId, scheduleId, stepName, channel, status, errorMessage);
        return ResponseEntity.ok(toEventResponse(event));
    }

    private DunningEventResponse toEventResponse(DunningEvent event) {
        return new DunningEventResponse(
                event.getId(),
                event.getAccount() != null ? event.getAccount().getId() : null,
                event.getInvoice() != null ? event.getInvoice().getId() : null,
                event.getSchedule() != null ? event.getSchedule().getId() : null,
                event.getStepName(),
                event.getChannel(),
                event.getStatus(),
                event.getAttemptNumber(),
                event.getOccurredAt(),
                event.getErrorMessage(),
                event.getCreatedAt(),
                event.getUpdatedAt());
    }

    private DunningScheduleResponse toScheduleResponse(DunningSchedule schedule) {
        return new DunningScheduleResponse(
                schedule.getId(),
                schedule.getAccount() != null ? schedule.getAccount().getId() : null,
                schedule.getName(),
                schedule.getDescription(),
                schedule.isActive(),
                schedule.getStrategy(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt());
    }
}
