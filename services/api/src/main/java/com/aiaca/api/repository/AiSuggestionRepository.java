package com.aiaca.api.repository;

import com.aiaca.api.model.AiSuggestion;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, UUID> {
}
