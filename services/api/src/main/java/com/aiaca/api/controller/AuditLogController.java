package com.aiaca.api.controller;

import com.aiaca.api.dto.billing.BillingDtos.PageResponse;
import com.aiaca.api.dto.billing.BillingDtos.AuditLogResponse;
import com.aiaca.api.model.billing.AuditLog;
import com.aiaca.api.service.billing.AuditLogService;
import com.aiaca.api.service.billing.BillingMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final BillingMapper billingMapper;

    public AuditLogController(AuditLogService auditLogService, BillingMapper billingMapper) {
        this.auditLogService = auditLogService;
        this.billingMapper = billingMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','VIEWER')")
    public PageResponse<AuditLogResponse> listAuditLogs(@RequestParam(name = "accountId", required = false) UUID accountId,
                                                        @RequestParam(name = "entityType", required = false) String entityType,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "25") int pageSize) {
        Page<AuditLog> results = auditLogService.list(accountId, entityType, page, pageSize);
        List<AuditLogResponse> items = results.getContent().stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getAccount() != null ? log.getAccount().getId() : null,
                        log.getActor() != null ? log.getActor().getId() : null,
                        log.getActorEmail(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getRequestId(),
                        log.getMetadata(),
                        log.getCreatedAt(),
                        log.getUpdatedAt()))
                .toList();
        return new PageResponse<>(items, results.getTotalElements(), results.getNumber(), results.getSize());
    }
}
