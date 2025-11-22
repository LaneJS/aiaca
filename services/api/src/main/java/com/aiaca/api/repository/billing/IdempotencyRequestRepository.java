package com.aiaca.api.repository.billing;

import com.aiaca.api.model.billing.IdempotencyRequest;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdempotencyRequestRepository extends JpaRepository<IdempotencyRequest, UUID> {
    Optional<IdempotencyRequest> findByAccountIdAndIdempotencyKey(UUID accountId, String idempotencyKey);
    Optional<IdempotencyRequest> findByIdempotencyKey(String idempotencyKey);
}

