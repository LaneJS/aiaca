import { z } from 'zod';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DELINQUENT = 'DELINQUENT',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum PaymentMethodType {
  CARD = 'CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
}

export enum PaymentMethodStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED',
}

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum PriceInterval {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum UsageType {
  LICENSED = 'LICENSED',
  METERED = 'METERED',
}

export enum CouponDuration {
  ONCE = 'ONCE',
  REPEATING = 'REPEATING',
  FOREVER = 'FOREVER',
}

export enum SubscriptionStatus {
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
  PAUSED = 'PAUSED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  PAID = 'PAID',
  UNCOLLECTIBLE = 'UNCOLLECTIBLE',
  VOID = 'VOID',
  PAST_DUE = 'PAST_DUE',
}

export enum CollectionMethod {
  SEND_INVOICE = 'SEND_INVOICE',
  CHARGE_AUTOMATICALLY = 'CHARGE_AUTOMATICALLY',
}

export enum ChargeStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export enum DisputeStatus {
  WARNING_NEEDS_RESPONSE = 'WARNING_NEEDS_RESPONSE',
  WARNING_UNDER_REVIEW = 'WARNING_UNDER_REVIEW',
  WARNING_CLOSED = 'WARNING_CLOSED',
  NEEDS_RESPONSE = 'NEEDS_RESPONSE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  WON = 'WON',
  LOST = 'LOST',
}

export enum CreditNoteStatus {
  ISSUED = 'ISSUED',
  APPLIED = 'APPLIED',
  VOIDED = 'VOIDED',
}

export enum AdjustmentType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum DunningEventStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  RETRY_SCHEDULED = 'RETRY_SCHEDULED',
  RESOLVED = 'RESOLVED',
  FAILED = 'FAILED',
}

export enum WebhookEventStatus {
  RECEIVED = 'RECEIVED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

const uuidSchema = z.string().uuid();
const timestampSchema = z.string();
const metadataSchema = z.record(z.any()).optional();
const currencySchema = z.string().length(3);

export const sortDirectionSchema = z.enum(['asc', 'desc']);
export const paginationParamsSchema = z.object({
  page: z.number().int().nonnegative().default(0),
  pageSize: z.number().int().positive().max(500).default(25),
  sortBy: z.string().min(1).optional(),
  sortDir: sortDirectionSchema.optional(),
});
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export const accountSchema = z.object({
  id: uuidSchema,
  ownerId: uuidSchema.optional(),
  name: z.string().min(1),
  status: z.nativeEnum(AccountStatus),
  currency: currencySchema,
  stripeCustomerId: z.string().optional(),
  primaryContactEmail: z.string().email().optional(),
  taxId: z.string().optional(),
  taxExempt: z.boolean(),
  billingAddress: metadataSchema,
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Account = z.infer<typeof accountSchema>;

export const contactSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string().optional(),
  primary: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Contact = z.infer<typeof contactSchema>;

export const paymentMethodSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  type: z.nativeEnum(PaymentMethodType),
  status: z.nativeEnum(PaymentMethodStatus),
  brand: z.string().optional(),
  last4: z.string().length(4).optional(),
  expMonth: z.number().int().positive().optional(),
  expYear: z.number().int().positive().optional(),
  stripePaymentMethodId: z.string().optional(),
  billingName: z.string().optional(),
  defaultMethod: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const planSchema = z.object({
  id: uuidSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(PlanStatus),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Plan = z.infer<typeof planSchema>;

export const priceSchema = z.object({
  id: uuidSchema,
  planId: uuidSchema,
  amount: z.number().int(),
  currency: currencySchema,
  interval: z.nativeEnum(PriceInterval),
  intervalCount: z.number().int().positive(),
  usageType: z.nativeEnum(UsageType),
  trialPeriodDays: z.number().int().positive().optional(),
  billingScheme: z.string().optional(),
  stripePriceId: z.string().optional(),
  active: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Price = z.infer<typeof priceSchema>;

export const couponSchema = z.object({
  id: uuidSchema,
  code: z.string().min(1),
  percentOff: z.number().nonnegative().max(100).optional(),
  amountOff: z.number().int().optional(),
  duration: z.nativeEnum(CouponDuration),
  durationInMonths: z.number().int().positive().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  redeemBy: timestampSchema.optional(),
  valid: z.boolean(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Coupon = z.infer<typeof couponSchema>;

export const subscriptionSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  status: z.nativeEnum(SubscriptionStatus),
  currency: currencySchema,
  stripeSubscriptionId: z.string().optional(),
  couponId: uuidSchema.optional(),
  startDate: timestampSchema.optional(),
  currentPeriodStart: timestampSchema.optional(),
  currentPeriodEnd: timestampSchema.optional(),
  trialEnd: timestampSchema.optional(),
  cancelAt: timestampSchema.optional(),
  canceledAt: timestampSchema.optional(),
  endedAt: timestampSchema.optional(),
  collectionMethod: z.nativeEnum(CollectionMethod).optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const subscriptionItemSchema = z.object({
  id: uuidSchema,
  subscriptionId: uuidSchema,
  priceId: uuidSchema,
  quantity: z.number().int().positive(),
  stripeSubscriptionItemId: z.string().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.optional(),
});
export type SubscriptionItem = z.infer<typeof subscriptionItemSchema>;

export const invoiceSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  subscriptionId: uuidSchema.optional(),
  couponId: uuidSchema.optional(),
  number: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus),
  currency: currencySchema,
  subtotal: z.number().int().optional(),
  total: z.number().int().optional(),
  amountDue: z.number().int().optional(),
  amountPaid: z.number().int().optional(),
  amountRemaining: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  feeAmount: z.number().int().optional(),
  dueDate: timestampSchema.optional(),
  issuedAt: timestampSchema.optional(),
  periodStart: timestampSchema.optional(),
  periodEnd: timestampSchema.optional(),
  collectionMethod: z.nativeEnum(CollectionMethod).optional(),
  stripeInvoiceId: z.string().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const invoiceLineSchema = z.object({
  id: uuidSchema,
  invoiceId: uuidSchema,
  priceId: uuidSchema.optional(),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
  unitAmount: z.number().int(),
  amount: z.number().int(),
  proration: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;

export const chargeSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  invoiceId: uuidSchema.optional(),
  paymentMethodId: uuidSchema.optional(),
  status: z.nativeEnum(ChargeStatus),
  amount: z.number().int(),
  currency: currencySchema,
  stripeChargeId: z.string().optional(),
  failureCode: z.string().optional(),
  failureMessage: z.string().optional(),
  authorizedAt: timestampSchema.optional(),
  capturedAt: timestampSchema.optional(),
  refundedAmount: z.number().int().optional(),
  feeAmount: z.number().int().optional(),
  netAmount: z.number().int().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Charge = z.infer<typeof chargeSchema>;

export const refundSchema = z.object({
  id: uuidSchema,
  chargeId: uuidSchema,
  status: z.nativeEnum(RefundStatus),
  amount: z.number().int(),
  currency: currencySchema,
  reason: z.string().optional(),
  stripeRefundId: z.string().optional(),
  refundedAt: timestampSchema.optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Refund = z.infer<typeof refundSchema>;

export const disputeSchema = z.object({
  id: uuidSchema,
  chargeId: uuidSchema,
  status: z.nativeEnum(DisputeStatus),
  amount: z.number().int(),
  currency: currencySchema,
  reason: z.string().optional(),
  evidenceDueAt: timestampSchema.optional(),
  evidenceSubmittedAt: timestampSchema.optional(),
  closedAt: timestampSchema.optional(),
  stripeDisputeId: z.string().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Dispute = z.infer<typeof disputeSchema>;

export const creditNoteSchema = z.object({
  id: uuidSchema,
  invoiceId: uuidSchema,
  status: z.nativeEnum(CreditNoteStatus),
  amount: z.number().int(),
  currency: currencySchema,
  reason: z.string().optional(),
  stripeCreditNoteId: z.string().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type CreditNote = z.infer<typeof creditNoteSchema>;

export const adjustmentSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  invoiceId: uuidSchema.optional(),
  type: z.nativeEnum(AdjustmentType),
  amount: z.number().int(),
  currency: currencySchema,
  description: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Adjustment = z.infer<typeof adjustmentSchema>;

export const auditLogSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema.optional(),
  actorUserId: uuidSchema.optional(),
  actorEmail: z.string().email().optional(),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  requestId: z.string().optional(),
  metadata: metadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type AuditLog = z.infer<typeof auditLogSchema>;

export const webhookEventSchema = z.object({
  id: uuidSchema,
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.any()),
  signature: z.string().optional(),
  receivedAt: timestampSchema,
  processedAt: timestampSchema.optional(),
  status: z.nativeEnum(WebhookEventStatus),
  lastError: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type WebhookEvent = z.infer<typeof webhookEventSchema>;

export const dunningScheduleSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema.optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean(),
  strategy: z.record(z.any()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type DunningSchedule = z.infer<typeof dunningScheduleSchema>;

export const dunningEventSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema,
  invoiceId: uuidSchema.optional(),
  scheduleId: uuidSchema.optional(),
  stepName: z.string().optional(),
  channel: z.string().optional(),
  status: z.nativeEnum(DunningEventStatus),
  attemptNumber: z.number().int().nonnegative().optional(),
  occurredAt: timestampSchema.optional(),
  errorMessage: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type DunningEvent = z.infer<typeof dunningEventSchema>;

export const reconciliationDriftSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema.optional(),
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  stripeId: z.string().optional(),
  driftType: z.string().optional(),
  details: metadataSchema,
  detectedAt: timestampSchema,
  resolvedAt: timestampSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type ReconciliationDrift = z.infer<typeof reconciliationDriftSchema>;

export const idempotencyRequestSchema = z.object({
  id: uuidSchema,
  accountId: uuidSchema.optional(),
  idempotencyKey: z.string().min(1),
  requestHash: z.string().optional(),
  requestId: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type IdempotencyRequest = z.infer<typeof idempotencyRequestSchema>;
