package com.aiaca.api.domain.model;

import com.aiaca.api.domain.model.enums.IssueSeverity;
import com.aiaca.api.domain.model.enums.IssueStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "scan_issues")
public class ScanIssue extends AbstractAuditable {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private Scan scan;

    @NotBlank
    @Column(name = "issue_type", nullable = false, length = 100)
    private String issueType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssueSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IssueStatus status = IssueStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String selector;

    @Column(name = "html_context", columnDefinition = "TEXT")
    private String htmlContext;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "page_url", columnDefinition = "TEXT")
    private String pageUrl;

    @OneToMany(mappedBy = "scanIssue")
    private Set<AiSuggestion> aiSuggestions = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Scan getScan() {
        return scan;
    }

    public void setScan(Scan scan) {
        this.scan = scan;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }

    public IssueSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(IssueSeverity severity) {
        this.severity = severity;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public String getSelector() {
        return selector;
    }

    public void setSelector(String selector) {
        this.selector = selector;
    }

    public String getHtmlContext() {
        return htmlContext;
    }

    public void setHtmlContext(String htmlContext) {
        this.htmlContext = htmlContext;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPageUrl() {
        return pageUrl;
    }

    public void setPageUrl(String pageUrl) {
        this.pageUrl = pageUrl;
    }

    public Set<AiSuggestion> getAiSuggestions() {
        return aiSuggestions;
    }
}
