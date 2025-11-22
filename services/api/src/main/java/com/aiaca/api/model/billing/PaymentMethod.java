package com.aiaca.api.model.billing;

import com.aiaca.api.model.BaseAuditedEntity;
import com.aiaca.api.model.billing.enums.PaymentMethodStatus;
import com.aiaca.api.model.billing.enums.PaymentMethodType;
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

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
public class PaymentMethod extends BaseAuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethodType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethodStatus status = PaymentMethodStatus.ACTIVE;

    @Column(length = 50)
    private String brand;

    @Column(length = 4)
    private String last4;

    private Integer expMonth;

    private Integer expYear;

    @Column(name = "stripe_payment_method_id", unique = true, length = 255)
    private String stripePaymentMethodId;

    @Column(name = "billing_name", length = 255)
    private String billingName;

    @Column(name = "is_default")
    private boolean defaultMethod;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
