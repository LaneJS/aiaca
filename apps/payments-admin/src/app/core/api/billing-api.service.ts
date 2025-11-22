import { inject, Injectable } from '@angular/core';
import {
  Account,
  AuditLog,
  Charge,
  Contact,
  Coupon,
  CreditNote,
  Dispute,
  DunningEvent,
  DunningSchedule,
  Invoice,
  PaymentMethod,
  Plan,
  Price,
  Refund,
  Subscription,
  WebhookEvent,
} from '@aiaca/domain';
import { ApiClient } from './api-client.service';
import { PageResponse } from './types';
import {
  AuditLogQuery,
  ChargeQuery,
  ContactPayload,
  CouponPayload,
  CreateAccountPayload,
  CreateChargePayload,
  CreateCreditNotePayload,
  CreateDisputePayload,
  CreateInvoicePayload,
  CreateRefundPayload,
  CreateSubscriptionPayload,
  DisputeQuery,
  DunningEventInput,
  InvoiceQuery,
  ListAccountsRequest,
  PaymentMethodPayload,
  PlanPayload,
  PricePayload,
  SubscriptionQuery,
  UpdateAccountPayload,
  UpdateChargeStatusPayload,
  UpdateDisputePayload,
  UpdatePlanPayload,
  UpdateSubscriptionStatusPayload,
  WebhookQuery,
} from './billing-contracts';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly api = inject(ApiClient);

  listAccounts(params?: ListAccountsRequest) {
    return this.api.get<PageResponse<Account>>('/billing/accounts', params);
  }

  getAccount(accountId: string) {
    return this.api.get<Account>(`/billing/accounts/${accountId}`);
  }

  createAccount(payload: CreateAccountPayload) {
    return this.api.post<Account>('/billing/accounts', payload);
  }

  updateAccount(accountId: string, payload: UpdateAccountPayload) {
    return this.api.patch<Account>(`/billing/accounts/${accountId}`, payload);
  }

  listContacts(accountId: string) {
    return this.api.get<Contact[]>(`/billing/accounts/${accountId}/contacts`);
  }

  addContact(accountId: string, payload: ContactPayload) {
    return this.api.post<Contact>(`/billing/accounts/${accountId}/contacts`, payload);
  }

  updateContact(accountId: string, contactId: string, payload: ContactPayload) {
    return this.api.patch<Contact>(`/billing/accounts/${accountId}/contacts/${contactId}`, payload);
  }

  deleteContact(accountId: string, contactId: string) {
    return this.api.delete<void>(`/billing/accounts/${accountId}/contacts/${contactId}`);
  }

  listPaymentMethods(accountId: string) {
    return this.api.get<PaymentMethod[]>(`/billing/accounts/${accountId}/payment-methods`);
  }

  addPaymentMethod(accountId: string, payload: PaymentMethodPayload) {
    return this.api.post<PaymentMethod>(`/billing/accounts/${accountId}/payment-methods`, payload);
  }

  updatePaymentMethod(accountId: string, methodId: string, payload: PaymentMethodPayload) {
    return this.api.patch<PaymentMethod>(`/billing/accounts/${accountId}/payment-methods/${methodId}`, payload);
  }

  deletePaymentMethod(accountId: string, methodId: string) {
    return this.api.delete<void>(`/billing/accounts/${accountId}/payment-methods/${methodId}`);
  }

  listPlans(params?: { status?: Plan['status']; page?: number; pageSize?: number }) {
    return this.api.get<PageResponse<Plan>>('/billing/plans', params);
  }

  createPlan(payload: PlanPayload) {
    return this.api.post<Plan>('/billing/plans', payload);
  }

  updatePlan(planId: string, payload: UpdatePlanPayload) {
    return this.api.patch<Plan>(`/billing/plans/${planId}`, payload);
  }

  listPrices(planId: string) {
    return this.api.get<Price[]>(`/billing/plans/${planId}/prices`);
  }

  addPrice(planId: string, payload: PricePayload) {
    return this.api.post<Price>(`/billing/plans/${planId}/prices`, payload);
  }

  listCoupons(params?: { page?: number; pageSize?: number }) {
    return this.api.get<PageResponse<Coupon>>('/billing/coupons', params);
  }

  createCoupon(payload: CouponPayload) {
    return this.api.post<Coupon>('/billing/coupons', payload);
  }

  listSubscriptions(params?: SubscriptionQuery) {
    return this.api.get<PageResponse<Subscription>>('/billing/subscriptions', params);
  }

  getSubscription(subscriptionId: string) {
    return this.api.get<Subscription>(`/billing/subscriptions/${subscriptionId}`);
  }

  createSubscription(payload: CreateSubscriptionPayload) {
    return this.api.post<Subscription>('/billing/subscriptions', payload);
  }

  updateSubscriptionStatus(subscriptionId: string, payload: UpdateSubscriptionStatusPayload) {
    return this.api.patch<Subscription>(`/billing/subscriptions/${subscriptionId}/status`, payload);
  }

  listInvoices(params?: InvoiceQuery) {
    return this.api.get<PageResponse<Invoice>>('/billing/invoices', params);
  }

  getInvoice(invoiceId: string) {
    return this.api.get<Invoice>(`/billing/invoices/${invoiceId}`);
  }

  createInvoice(payload: CreateInvoicePayload) {
    return this.api.post<Invoice>('/billing/invoices', payload);
  }

  listCharges(params?: ChargeQuery) {
    return this.api.get<PageResponse<Charge>>('/billing/payments/charges', params);
  }

  createCharge(payload: CreateChargePayload) {
    return this.api.post<Charge>('/billing/payments/charges', payload);
  }

  updateChargeStatus(chargeId: string, payload: UpdateChargeStatusPayload) {
    return this.api.patch<Charge>(`/billing/payments/charges/${chargeId}/status`, null, {
      params: {
        status: payload.status,
        failureCode: payload.failureCode,
        failureMessage: payload.failureMessage,
      },
    });
  }

  createRefund(chargeId: string, payload: CreateRefundPayload) {
    return this.api.post<Refund>(`/billing/payments/charges/${chargeId}/refunds`, payload);
  }

  createCreditNote(invoiceId: string, payload: CreateCreditNotePayload) {
    return this.api.post<CreditNote>(`/billing/payments/invoices/${invoiceId}/credit-notes`, payload);
  }

  listDisputes(params?: DisputeQuery) {
    return this.api.get<PageResponse<Dispute>>('/billing/disputes', params);
  }

  createDispute(payload: CreateDisputePayload) {
    return this.api.post<Dispute>('/billing/disputes', null, {
      params: {
        chargeId: payload.chargeId,
        amount: payload.amount,
        currency: payload.currency,
        reason: payload.reason,
      },
    });
  }

  updateDispute(disputeId: string, payload: UpdateDisputePayload) {
    return this.api.patch<Dispute>(`/billing/disputes/${disputeId}/status`, null, {
      params: {
        status: payload.status,
      },
    });
  }

  listDunningEvents() {
    return this.api.get<DunningEvent[]>('/billing/dunning/events');
  }

  recordDunningEvent(input: DunningEventInput) {
    return this.api.post<DunningEvent>('/billing/dunning/events', null, {
      params: {
        accountId: input.accountId,
        invoiceId: input.invoiceId,
        scheduleId: input.scheduleId,
        stepName: input.stepName,
        channel: input.channel,
        status: input.status,
        errorMessage: input.errorMessage,
      },
    });
  }

  listDunningSchedules() {
    return this.api.get<DunningSchedule[]>('/billing/dunning/schedules');
  }

  listDunningQueue() {
    return this.api.get<Invoice[]>('/billing/dunning/queue');
  }

  listWebhookEvents(params?: WebhookQuery) {
    return this.api.get<PageResponse<WebhookEvent>>('/billing/webhooks', params);
  }

  updateWebhookStatus(eventId: string, status: WebhookEvent['status'], lastError?: string) {
    return this.api.patch<WebhookEvent>(`/billing/webhooks/${eventId}/status`, null, {
      params: { status, lastError },
    });
  }

  listAuditLogs(params?: AuditLogQuery) {
    return this.api.get<PageResponse<AuditLog>>('/billing/audit-logs', params);
  }
}
