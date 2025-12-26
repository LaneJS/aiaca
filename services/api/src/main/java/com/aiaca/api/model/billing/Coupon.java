package com.aiaca.api.model.billing;

import com.aiaca.api.model.BaseAuditedEntity;
import com.aiaca.api.model.billing.enums.CouponDuration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "coupons")
@Getter
@Setter
public class Coupon extends BaseAuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "percent_off", precision = 5, scale = 2)
    private BigDecimal percentOff;

    @Column(name = "amount_off")
    private Long amountOff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CouponDuration duration;

    @Column(name = "duration_in_months")
    private Integer durationInMonths;

    @Column(name = "max_redemptions")
    private Integer maxRedemptions;

    @Column(name = "redeem_by")
    private LocalDateTime redeemBy;

    private boolean valid = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
