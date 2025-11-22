package com.aiaca.api.service.billing;

import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ConflictException;
import com.aiaca.api.model.billing.Account;
import com.aiaca.api.model.billing.IdempotencyRequest;
import com.aiaca.api.repository.billing.IdempotencyRequestRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class IdempotencyService {

    private final IdempotencyRequestRepository repository;

    public IdempotencyService(IdempotencyRequestRepository repository) {
        this.repository = repository;
    }

    public IdempotencyRequest assertOrRecord(Account account, String idempotencyKey, String requestHash, String requestId, String resourceType, String resourceId) {
        if (!StringUtils.hasText(idempotencyKey)) {
            throw new BadRequestException("Idempotency-Key header is required for this operation");
        }
        Optional<IdempotencyRequest> existing = account != null
                ? repository.findByAccountIdAndIdempotencyKey(account.getId(), idempotencyKey)
                : repository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            throw new ConflictException("Idempotency key already used for this account");
        }

        IdempotencyRequest record = new IdempotencyRequest();
        record.setAccount(account);
        record.setIdempotencyKey(idempotencyKey);
        record.setRequestHash(requestHash);
        record.setRequestId(requestId);
        record.setResourceType(resourceType);
        record.setResourceId(resourceId);
        return repository.save(record);
    }
}
