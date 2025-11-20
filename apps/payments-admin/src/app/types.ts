export type AccountStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled';

export interface AccountRecord {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  seats: number;
  status: AccountStatus;
  renewsOn: string;
  lastPaymentDate: string;
  outstandingBalance: number;
  tags: string[];
}

export type PaymentStatus = 'paid' | 'refunded' | 'failed' | 'past_due' | 'pending';

export interface PaymentRecord {
  id: string;
  invoice: string;
  accountId: string;
  customer: string;
  amount: number;
  date: string;
  method: string;
  status: PaymentStatus;
  period: string;
  notes?: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  cadence: 'monthly' | 'yearly';
  seatsIncluded: number;
  features: string[];
  activeSubscribers: number;
}

export interface BillingSummary {
  activeAccounts: number;
  trialing: number;
  atRisk: number;
  mrr: number;
  monthlyCollected: number;
  refunds: number;
}
