import {
  AccountStatus,
  ChargeStatus,
  CollectionMethod,
  CouponDuration,
  DisputeStatus,
  DunningEventStatus,
  InvoiceStatus,
  PaymentMethodStatus,
  PaymentMethodType,
  PlanStatus,
  PriceInterval,
  SubscriptionStatus,
  UsageType,
  WebhookEventStatus,
} from '@aiaca/domain';
import { PageParams } from './types';

export interface ListAccountsRequest extends PageParams {
  status?: AccountStatus;
  currency?: string;
  search?: string;
}

export interface CreateAccountPayload {
  name: string;
  currency: string;
  stripeCustomerId?: string;
  primaryContactEmail?: string;
  taxId?: string;
  taxExempt?: boolean;
  billingAddress?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload> & {
  status?: AccountStatus;
};

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  primary?: boolean;
}

export interface PaymentMethodPayload {
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  stripePaymentMethodId?: string;
  billingName?: string;
  defaultMethod?: boolean;
}

export interface PlanPayload {
  code: string;
  name: string;
  description?: string;
  status?: PlanStatus;
  metadata?: Record<string, unknown>;
}

export type UpdatePlanPayload = Partial<PlanPayload>;

export interface PricePayload {
  amount: number;
  currency: string;
  interval: PriceInterval;
  intervalCount: number;
  usageType?: UsageType;
  trialPeriodDays?: number;
  billingScheme?: string;
  stripePriceId?: string;
  active?: boolean;
}

export interface CouponPayload {
  code: string;
  percentOff?: number;
  amountOff?: number;
  duration: CouponDuration;
  durationInMonths?: number;
  maxRedemptions?: number;
  redeemBy?: string;
  valid?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionItemInput {
  priceId: string;
  quantity: number;
}

export interface CreateSubscriptionPayload {
  accountId: string;
  items: SubscriptionItemInput[];
  currency: string;
  collectionMethod?: CollectionMethod;
  couponId?: string;
  trialEnd?: string;
  startDate?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionStatusPayload {
  status: SubscriptionStatus;
  cancelAt?: string;
}

export interface SubscriptionQuery extends PageParams {
  accountId?: string;
  status?: SubscriptionStatus;
}

export interface InvoiceLinePayload {
  priceId?: string;
  description?: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  proration?: boolean;
}

export interface CreateInvoicePayload {
  accountId: string;
  subscriptionId?: string;
  couponId?: string;
  currency: string;
  collectionMethod?: CollectionMethod;
  dueDate?: string;
  lines: InvoiceLinePayload[];
  metadata?: Record<string, unknown>;
}

export interface InvoiceQuery extends PageParams {
  accountId?: string;
  status?: InvoiceStatus;
}

export interface CreateChargePayload {
  accountId: string;
  invoiceId?: string;
  paymentMethodId?: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateChargeStatusPayload {
  status: ChargeStatus;
  failureCode?: string;
  failureMessage?: string;
}

export interface ChargeQuery extends PageParams {
  accountId?: string;
  status?: ChargeStatus;
}

export interface CreateRefundPayload {
  amount: number;
  reason?: string;
}

export interface CreateCreditNotePayload {
  amount: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface DisputeQuery extends PageParams {
  status?: DisputeStatus;
}

export interface CreateDisputePayload {
  chargeId: string;
  amount: number;
  currency: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDisputePayload {
  status: DisputeStatus;
  evidenceSubmittedAt?: string;
}

export interface AuditLogQuery extends PageParams {
  accountId?: string;
  entityType?: string;
}

export interface WebhookQuery extends PageParams {
  status?: WebhookEventStatus;
}

export interface DunningEventInput {
  accountId: string;
  invoiceId?: string;
  scheduleId?: string;
  stepName?: string;
  channel?: string;
  status: DunningEventStatus;
  errorMessage?: string;
}
