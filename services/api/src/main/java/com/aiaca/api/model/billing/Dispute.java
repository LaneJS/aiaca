package com.aiaca.api.model.billing;

import com.aiaca.api.model.BaseAuditedEntity;
import com.aiaca.api.model.billing.enums.DisputeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "disputes")
@Getter
@Setter
public class Dispute extends BaseAuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_id", nullable = false)
    private Charge charge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DisputeStatus status = DisputeStatus.UNDER_REVIEW;

    @Column(nullable = false)
    private long amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(length = 100)
    private String reason;

    @Column(name = "evidence_due_at")
    private LocalDateTime evidenceDueAt;

    @Column(name = "evidence_submitted_at")
    private LocalDateTime evidenceSubmittedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "stripe_dispute_id", unique = true, length = 255)
    private String stripeDisputeId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;
}
