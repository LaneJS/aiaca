package com.aiaca.api.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ai_suggestions")
@Getter
@Setter
public class AiSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "scan_issue_id")
    private ScanIssue scanIssue;

    @Enumerated(EnumType.STRING)
    private SuggestionType suggestionType = SuggestionType.TEXT;

    private String suggestion;

    private String rationale;

    private LocalDateTime createdAt = LocalDateTime.now();
}
