package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.ApiKey;
import com.aiaca.api.domain.model.enums.ApiKeyType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    Optional<ApiKey> findByKeyValue(String keyValue);

    List<ApiKey> findByKeyType(ApiKeyType keyType);
}
