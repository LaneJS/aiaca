package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.EmbedKey;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmbedKeyRepository extends JpaRepository<EmbedKey, UUID> {
    Optional<EmbedKey> findByKeyValue(String keyValue);
}
