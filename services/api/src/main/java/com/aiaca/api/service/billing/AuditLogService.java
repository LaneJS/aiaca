package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.User;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.AuditLog;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.repository.billing.AccountRepository;
import com.aiaca.api.repository.billing.AuditLogRepository;
import com.aiaca.api.util.JsonHelper;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final JsonHelper jsonHelper;

    public AuditLogService(AuditLogRepository auditLogRepository,
                           AccountRepository accountRepository,
                           UserRepository userRepository,
                           JsonHelper jsonHelper) {
        this.auditLogRepository = auditLogRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.jsonHelper = jsonHelper;
    }

    @Transactional
    public void record(UUID accountId, UUID actorUserId, String actorEmail, String action, String entityType, String entityId, String requestId, Map<String, Object> metadata) {
        AuditLog log = new AuditLog();
        if (accountId != null) {
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found for audit log"));
            log.setAccount(account);
        }
        if (actorUserId != null) {
            User actor = userRepository.findById(actorUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Actor not found for audit log"));
            log.setActor(actor);
            log.setActorEmail(actor.getEmail());
        } else if (StringUtils.hasText(actorEmail)) {
            log.setActorEmail(actorEmail);
        }
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setRequestId(requestId);
        log.setMetadata(jsonHelper.toJson(metadata));
        auditLogRepository.save(log);
    }

    public Page<AuditLog> list(UUID accountId, String entityType, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        if (accountId != null) {
            return auditLogRepository.findByAccountId(accountId, pageable);
        }
        if (StringUtils.hasText(entityType)) {
            return auditLogRepository.findByEntityType(entityType, pageable);
        }
        return auditLogRepository.findAll(pageable);
    }
}
