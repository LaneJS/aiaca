package com.aiaca.api.domain.repository;

import com.aiaca.api.domain.model.AiSuggestion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, UUID> {
    List<AiSuggestion> findByScanIssueId(UUID issueId);
}
