package com.aiaca.api.dto.billing;

import com.aiaca.api.model.billing.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class BillingDtos {
    private BillingDtos() {}

    public record PageResponse<T>(List<T> items, long total, int page, int pageSize) {}

    public record AccountResponse(
            UUID id,
            String name,
            AccountStatus status,
            String currency,
            String stripeCustomerId,
            String primaryContactEmail,
            String taxId,
            boolean taxExempt,
            Map<String, Object> billingAddress,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateAccountRequest(
            @NotBlank String name,
            @NotBlank @Size(min = 3, max = 3) String currency,
            String stripeCustomerId,
            @Email String primaryContactEmail,
            String taxId,
            boolean taxExempt,
            Map<String, Object> billingAddress,
            Map<String, Object> metadata) {
    }

    public record UpdateAccountRequest(
            String name,
            AccountStatus status,
            @Size(min = 3, max = 3) String currency,
            @Email String primaryContactEmail,
            String taxId,
            Boolean taxExempt,
            Map<String, Object> billingAddress,
            Map<String, Object> metadata) {
    }

    public record ContactResponse(
            UUID id,
            UUID accountId,
            String name,
            String email,
            String phone,
            String role,
            boolean primary,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record ContactRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            String phone,
            String role,
            boolean primary) {
    }

    public record PaymentMethodResponse(
            UUID id,
            UUID accountId,
            PaymentMethodType type,
            PaymentMethodStatus status,
            String brand,
            String last4,
            Integer expMonth,
            Integer expYear,
            String stripePaymentMethodId,
            String billingName,
            boolean defaultMethod,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record PaymentMethodRequest(
            @NotNull PaymentMethodType type,
            PaymentMethodStatus status,
            String brand,
            @Size(min = 4, max = 4) String last4,
            Integer expMonth,
            Integer expYear,
            String stripePaymentMethodId,
            String billingName,
            boolean defaultMethod) {
    }

    public record PlanResponse(
            UUID id,
            String code,
            String name,
            String description,
            PlanStatus status,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreatePlanRequest(
            @NotBlank String code,
            @NotBlank String name,
            String description,
            PlanStatus status,
            Map<String, Object> metadata) {
    }

    public record PriceResponse(
            UUID id,
            UUID planId,
            long amount,
            String currency,
            PriceInterval interval,
            int intervalCount,
            UsageType usageType,
            Integer trialPeriodDays,
            String billingScheme,
            String stripePriceId,
            boolean active,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreatePriceRequest(
            @NotNull Long amount,
            @NotBlank @Size(min = 3, max = 3) String currency,
            @NotNull PriceInterval interval,
            @Min(1) int intervalCount,
            UsageType usageType,
            Integer trialPeriodDays,
            String billingScheme,
            String stripePriceId,
            Boolean active) {
    }

    public record CouponResponse(
            UUID id,
            String code,
            Double percentOff,
            Long amountOff,
            CouponDuration duration,
            Integer durationInMonths,
            Integer maxRedemptions,
            LocalDateTime redeemBy,
            boolean valid,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateCouponRequest(
            @NotBlank String code,
            Double percentOff,
            Long amountOff,
            @NotNull CouponDuration duration,
            Integer durationInMonths,
            Integer maxRedemptions,
            LocalDateTime redeemBy,
            Boolean valid,
            Map<String, Object> metadata) {
    }

    public record SubscriptionItemRequest(
            @NotNull UUID priceId,
            @Min(1) int quantity) {
    }

    public record SubscriptionResponse(
            UUID id,
            UUID accountId,
            SubscriptionStatus status,
            String currency,
            String stripeSubscriptionId,
            UUID couponId,
            LocalDateTime startDate,
            LocalDateTime currentPeriodStart,
            LocalDateTime currentPeriodEnd,
            LocalDateTime trialEnd,
            LocalDateTime cancelAt,
            LocalDateTime canceledAt,
            LocalDateTime endedAt,
            CollectionMethod collectionMethod,
            Map<String, Object> metadata,
            List<SubscriptionItemResponse> items,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record SubscriptionItemResponse(
            UUID id,
            UUID subscriptionId,
            UUID priceId,
            int quantity,
            String stripeSubscriptionItemId,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateSubscriptionRequest(
            @NotNull UUID accountId,
            @Valid List<SubscriptionItemRequest> items,
            @NotBlank @Size(min = 3, max = 3) String currency,
            CollectionMethod collectionMethod,
            UUID couponId,
            LocalDateTime trialEnd,
            LocalDateTime startDate,
            Map<String, Object> metadata) {
    }

    public record UpdateSubscriptionStatusRequest(@NotNull SubscriptionStatus status, LocalDateTime cancelAt) {
    }

    public record InvoiceLineRequest(
            UUID priceId,
            String description,
            @Min(1) int quantity,
            @NotNull Long unitAmount,
            @NotNull Long amount,
            boolean proration) {
    }

    public record InvoiceResponse(
            UUID id,
            UUID accountId,
            UUID subscriptionId,
            UUID couponId,
            String number,
            InvoiceStatus status,
            String currency,
            Long subtotal,
            Long total,
            Long amountDue,
            Long amountPaid,
            Long amountRemaining,
            Long taxAmount,
            Long feeAmount,
            LocalDateTime dueDate,
            LocalDateTime issuedAt,
            LocalDateTime periodStart,
            LocalDateTime periodEnd,
            CollectionMethod collectionMethod,
            String stripeInvoiceId,
            Map<String, Object> metadata,
            List<InvoiceLineResponse> lines,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record InvoiceLineResponse(
            UUID id,
            UUID invoiceId,
            UUID priceId,
            String description,
            int quantity,
            long unitAmount,
            long amount,
            boolean proration,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateInvoiceRequest(
            @NotNull UUID accountId,
            UUID subscriptionId,
            UUID couponId,
            @NotBlank @Size(min = 3, max = 3) String currency,
            CollectionMethod collectionMethod,
            LocalDateTime dueDate,
            @Valid List<InvoiceLineRequest> lines,
            Map<String, Object> metadata) {
    }

    public record ChargeResponse(
            UUID id,
            UUID accountId,
            UUID invoiceId,
            UUID paymentMethodId,
            ChargeStatus status,
            long amount,
            String currency,
            String stripeChargeId,
            String failureCode,
            String failureMessage,
            LocalDateTime authorizedAt,
            LocalDateTime capturedAt,
            Long refundedAmount,
            Long feeAmount,
            Long netAmount,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateChargeRequest(
            @NotNull UUID accountId,
            UUID invoiceId,
            UUID paymentMethodId,
            @NotNull Long amount,
            @NotBlank @Size(min = 3, max = 3) String currency,
            Map<String, Object> metadata) {
    }

    public record RefundResponse(
            UUID id,
            UUID chargeId,
            RefundStatus status,
            long amount,
            String currency,
            String reason,
            String stripeRefundId,
            LocalDateTime refundedAt,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateRefundRequest(@NotNull Long amount, String reason) {
    }

    public record CreditNoteResponse(
            UUID id,
            UUID invoiceId,
            CreditNoteStatus status,
            long amount,
            String currency,
            String reason,
            String stripeCreditNoteId,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record CreateCreditNoteRequest(
            @NotNull Long amount,
            String reason,
            Map<String, Object> metadata) {
    }

    public record AuditLogResponse(
            UUID id,
            UUID accountId,
            UUID actorUserId,
            String actorEmail,
            String action,
            String entityType,
            String entityId,
            String requestId,
            String metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record DunningScheduleResponse(
            UUID id,
            UUID accountId,
            String name,
            String description,
            boolean active,
            String strategy,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record DunningEventResponse(
            UUID id,
            UUID accountId,
            UUID invoiceId,
            UUID scheduleId,
            String stepName,
            String channel,
            DunningEventStatus status,
            Integer attemptNumber,
            LocalDateTime occurredAt,
            String errorMessage,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record DisputeResponse(
            UUID id,
            UUID chargeId,
            DisputeStatus status,
            long amount,
            String currency,
            String reason,
            LocalDateTime evidenceDueAt,
            LocalDateTime evidenceSubmittedAt,
            LocalDateTime closedAt,
            String stripeDisputeId,
            Map<String, Object> metadata,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record WebhookEventResponse(
            UUID id,
            String eventId,
            String eventType,
            String payload,
            String signature,
            LocalDateTime receivedAt,
            LocalDateTime processedAt,
            WebhookEventStatus status,
            String lastError,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }
}
