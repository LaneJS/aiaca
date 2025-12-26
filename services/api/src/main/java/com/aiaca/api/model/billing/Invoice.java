package com.aiaca.api.model.billing;

import com.aiaca.api.model.BaseAuditedEntity;
import com.aiaca.api.model.billing.enums.CollectionMethod;
import com.aiaca.api.model.billing.enums.InvoiceStatus;
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
@Table(name = "invoices")
@Getter
@Setter
public class Invoice extends BaseAuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(unique = true, length = 100)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    private Long subtotal;

    private Long total;

    @Column(name = "amount_due")
    private Long amountDue;

    @Column(name = "amount_paid")
    private Long amountPaid;

    @Column(name = "amount_remaining")
    private Long amountRemaining;

    @Column(name = "tax_amount")
    private Long taxAmount;

    @Column(name = "fee_amount")
    private Long feeAmount;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_method", length = 50)
    private CollectionMethod collectionMethod;

    @Column(name = "stripe_invoice_id", unique = true, length = 255)
    private String stripeInvoiceId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;
}
