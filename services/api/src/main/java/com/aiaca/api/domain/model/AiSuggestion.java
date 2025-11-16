package com.aiaca.api.domain.model;

import com.aiaca.api.domain.model.enums.SuggestionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "ai_suggestions")
public class AiSuggestion {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_issue_id", nullable = false)
    private ScanIssue scanIssue;

    @Enumerated(EnumType.STRING)
    @Column(name = "suggestion_type", nullable = false, length = 50)
    private SuggestionType suggestionType = SuggestionType.TEXT;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String suggestion;

    @Column(columnDefinition = "TEXT")
    private String rationale;

    @Column(nullable = false)
    private boolean applied = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ScanIssue getScanIssue() {
        return scanIssue;
    }

    public void setScanIssue(ScanIssue scanIssue) {
        this.scanIssue = scanIssue;
    }

    public SuggestionType getSuggestionType() {
        return suggestionType;
    }

    public void setSuggestionType(SuggestionType suggestionType) {
        this.suggestionType = suggestionType;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public boolean isApplied() {
        return applied;
    }

    public void setApplied(boolean applied) {
        this.applied = applied;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
