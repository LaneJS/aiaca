package com.aiaca.api.model.billing;

import com.aiaca.api.model.BaseAuditedEntity;
import com.aiaca.api.model.billing.enums.CollectionMethod;
import com.aiaca.api.model.billing.enums.SubscriptionStatus;
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
@Table(name = "subscriptions")
@Getter
@Setter
public class Subscription extends BaseAuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubscriptionStatus status = SubscriptionStatus.INCOMPLETE;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(name = "stripe_subscription_id", unique = true, length = 255)
    private String stripeSubscriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "current_period_start")
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "trial_end")
    private LocalDateTime trialEnd;

    @Column(name = "cancel_at")
    private LocalDateTime cancelAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_method", length = 50)
    private CollectionMethod collectionMethod;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
