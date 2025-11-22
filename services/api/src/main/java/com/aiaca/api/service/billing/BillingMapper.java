package com.aiaca.api.service.billing;

import com.aiaca.api.dto.billing.BillingDtos.*;
import com.aiaca.api.model.billing.*;
import com.aiaca.api.util.JsonHelper;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class BillingMapper {
    private final JsonHelper jsonHelper;

    public BillingMapper(JsonHelper jsonHelper) {
        this.jsonHelper = jsonHelper;
    }

    public AccountResponse toAccountResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getStatus(),
                account.getCurrency(),
                account.getStripeCustomerId(),
                account.getPrimaryContactEmail(),
                account.getTaxId(),
                account.isTaxExempt(),
                jsonHelper.fromJson(account.getBillingAddress()),
                jsonHelper.fromJson(account.getMetadata()),
                account.getCreatedAt(),
                account.getUpdatedAt());
    }

    public ContactResponse toContactResponse(Contact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getAccount().getId(),
                contact.getName(),
                contact.getEmail(),
                contact.getPhone(),
                contact.getRole(),
                contact.isPrimary(),
                contact.getCreatedAt(),
                contact.getUpdatedAt());
    }

    public PaymentMethodResponse toPaymentMethodResponse(PaymentMethod method) {
        return new PaymentMethodResponse(
                method.getId(),
                method.getAccount().getId(),
                method.getType(),
                method.getStatus(),
                method.getBrand(),
                method.getLast4(),
                method.getExpMonth(),
                method.getExpYear(),
                method.getStripePaymentMethodId(),
                method.getBillingName(),
                method.isDefaultMethod(),
                method.getCreatedAt(),
                method.getUpdatedAt());
    }

    public PlanResponse toPlanResponse(Plan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getCode(),
                plan.getName(),
                plan.getDescription(),
                plan.getStatus(),
                jsonHelper.fromJson(plan.getMetadata()),
                plan.getCreatedAt(),
                plan.getUpdatedAt());
    }

    public PriceResponse toPriceResponse(Price price) {
        return new PriceResponse(
                price.getId(),
                price.getPlan().getId(),
                price.getAmount(),
                price.getCurrency(),
                price.getInterval(),
                price.getIntervalCount(),
                price.getUsageType(),
                price.getTrialPeriodDays(),
                price.getBillingScheme(),
                price.getStripePriceId(),
                price.isActive(),
                price.getCreatedAt(),
                price.getUpdatedAt());
    }

    public CouponResponse toCouponResponse(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getPercentOff() != null ? coupon.getPercentOff().doubleValue() : null,
                coupon.getAmountOff(),
                coupon.getDuration(),
                coupon.getDurationInMonths(),
                coupon.getMaxRedemptions(),
                coupon.getRedeemBy(),
                coupon.isValid(),
                jsonHelper.fromJson(coupon.getMetadata()),
                coupon.getCreatedAt(),
                coupon.getUpdatedAt());
    }

    public SubscriptionItemResponse toSubscriptionItemResponse(SubscriptionItem item) {
        return new SubscriptionItemResponse(
                item.getId(),
                item.getSubscription().getId(),
                item.getPrice().getId(),
                item.getQuantity(),
                item.getStripeSubscriptionItemId(),
                jsonHelper.fromJson(item.getMetadata()),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }

    public SubscriptionResponse toSubscriptionResponse(Subscription subscription, List<SubscriptionItem> items) {
        List<SubscriptionItemResponse> itemResponses = items.stream()
                .map(this::toSubscriptionItemResponse)
                .collect(Collectors.toList());
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getAccount().getId(),
                subscription.getStatus(),
                subscription.getCurrency(),
                subscription.getStripeSubscriptionId(),
                subscription.getCoupon() != null ? subscription.getCoupon().getId() : null,
                subscription.getStartDate(),
                subscription.getCurrentPeriodStart(),
                subscription.getCurrentPeriodEnd(),
                subscription.getTrialEnd(),
                subscription.getCancelAt(),
                subscription.getCanceledAt(),
                subscription.getEndedAt(),
                subscription.getCollectionMethod(),
                jsonHelper.fromJson(subscription.getMetadata()),
                itemResponses,
                subscription.getCreatedAt(),
                subscription.getUpdatedAt());
    }

    public InvoiceLineResponse toInvoiceLineResponse(InvoiceLine line) {
        return new InvoiceLineResponse(
                line.getId(),
                line.getInvoice().getId(),
                line.getPrice() != null ? line.getPrice().getId() : null,
                line.getDescription(),
                line.getQuantity(),
                line.getUnitAmount(),
                line.getAmount(),
                line.isProration(),
                line.getCreatedAt(),
                line.getUpdatedAt());
    }

    public InvoiceResponse toInvoiceResponse(Invoice invoice, List<InvoiceLine> lines) {
        List<InvoiceLineResponse> lineResponses = lines.stream()
                .map(this::toInvoiceLineResponse)
                .toList();
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getAccount().getId(),
                invoice.getSubscription() != null ? invoice.getSubscription().getId() : null,
                invoice.getCoupon() != null ? invoice.getCoupon().getId() : null,
                invoice.getNumber(),
                invoice.getStatus(),
                invoice.getCurrency(),
                invoice.getSubtotal(),
                invoice.getTotal(),
                invoice.getAmountDue(),
                invoice.getAmountPaid(),
                invoice.getAmountRemaining(),
                invoice.getTaxAmount(),
                invoice.getFeeAmount(),
                invoice.getDueDate(),
                invoice.getIssuedAt(),
                invoice.getPeriodStart(),
                invoice.getPeriodEnd(),
                invoice.getCollectionMethod(),
                invoice.getStripeInvoiceId(),
                jsonHelper.fromJson(invoice.getMetadata()),
                lineResponses,
                invoice.getCreatedAt(),
                invoice.getUpdatedAt());
    }

    public ChargeResponse toChargeResponse(Charge charge) {
        return new ChargeResponse(
                charge.getId(),
                charge.getAccount().getId(),
                charge.getInvoice() != null ? charge.getInvoice().getId() : null,
                charge.getPaymentMethod() != null ? charge.getPaymentMethod().getId() : null,
                charge.getStatus(),
                charge.getAmount(),
                charge.getCurrency(),
                charge.getStripeChargeId(),
                charge.getFailureCode(),
                charge.getFailureMessage(),
                charge.getAuthorizedAt(),
                charge.getCapturedAt(),
                charge.getRefundedAmount(),
                charge.getFeeAmount(),
                charge.getNetAmount(),
                jsonHelper.fromJson(charge.getMetadata()),
                charge.getCreatedAt(),
                charge.getUpdatedAt());
    }

    public RefundResponse toRefundResponse(Refund refund) {
        return new RefundResponse(
                refund.getId(),
                refund.getCharge().getId(),
                refund.getStatus(),
                refund.getAmount(),
                refund.getCurrency(),
                refund.getReason(),
                refund.getStripeRefundId(),
                refund.getRefundedAt(),
                jsonHelper.fromJson(refund.getMetadata()),
                refund.getCreatedAt(),
                refund.getUpdatedAt());
    }

    public CreditNoteResponse toCreditNoteResponse(CreditNote creditNote) {
        return new CreditNoteResponse(
                creditNote.getId(),
                creditNote.getInvoice().getId(),
                creditNote.getStatus(),
                creditNote.getAmount(),
                creditNote.getCurrency(),
                creditNote.getReason(),
                creditNote.getStripeCreditNoteId(),
                jsonHelper.fromJson(creditNote.getMetadata()),
                creditNote.getCreatedAt(),
                creditNote.getUpdatedAt());
    }

    public PageResponse<?> toPageResponse(List<?> items, long total, int page, int pageSize) {
        return new PageResponse<>(items, total, page, pageSize);
    }
}
