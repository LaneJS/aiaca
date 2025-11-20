import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AccountRecord,
  AccountStatus,
  BillingPlan,
  BillingSummary,
  PaymentRecord,
  PaymentStatus,
} from '../types';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const daysFromNow = (days: number) => {
  const instance = new Date();
  instance.setDate(instance.getDate() + days);
  return formatDate(instance);
};

interface PaymentInput {
  accountId: string;
  invoice: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  period: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BillingDataService {
  private readonly accountsSubject = new BehaviorSubject<AccountRecord[]>([
    {
      id: 'acct-1001',
      name: 'Olivia Hayes',
      email: 'olivia@maplelane.studio',
      plan: 'Growth',
      mrr: 189,
      seats: 8,
      status: 'active',
      renewsOn: daysFromNow(28),
      lastPaymentDate: formatDate(new Date()),
      outstandingBalance: 0,
      tags: ['design partner', 'priority support'],
    },
    {
      id: 'acct-1002',
      name: 'Quincy Analytics',
      email: 'ops@quincyanalytics.com',
      plan: 'Scale',
      mrr: 449,
      seats: 18,
      status: 'past_due',
      renewsOn: daysFromNow(12),
      lastPaymentDate: daysFromNow(-18),
      outstandingBalance: 325,
      tags: ['data team'],
    },
    {
      id: 'acct-1003',
      name: 'Brightline Retail',
      email: 'finance@brightlineretail.co',
      plan: 'Growth',
      mrr: 249,
      seats: 12,
      status: 'active',
      renewsOn: daysFromNow(20),
      lastPaymentDate: daysFromNow(-14),
      outstandingBalance: 0,
      tags: ['multi-store'],
    },
    {
      id: 'acct-1004',
      name: 'Cedar & Pine Agency',
      email: 'billing@cedarapine.agency',
      plan: 'Launch',
      mrr: 119,
      seats: 5,
      status: 'trialing',
      renewsOn: daysFromNow(6),
      lastPaymentDate: daysFromNow(-30),
      outstandingBalance: 0,
      tags: ['agency'],
    },
    {
      id: 'acct-1005',
      name: 'Northwind Supply',
      email: 'ap@northwind.supply',
      plan: 'Scale',
      mrr: 499,
      seats: 22,
      status: 'paused',
      renewsOn: daysFromNow(45),
      lastPaymentDate: daysFromNow(-90),
      outstandingBalance: 499,
      tags: ['paused'],
    },
  ]);

  private readonly paymentsSubject = new BehaviorSubject<PaymentRecord[]>([
    {
      id: 'pay-01',
      invoice: 'INV-4021',
      accountId: 'acct-1001',
      customer: 'Olivia Hayes',
      amount: 189,
      date: formatDate(new Date()),
      method: 'Visa •••• 9812',
      status: 'paid',
      period: 'Current month',
      notes: 'Auto-charge succeeded',
    },
    {
      id: 'pay-02',
      invoice: 'INV-4020',
      accountId: 'acct-1002',
      customer: 'Quincy Analytics',
      amount: 449,
      date: daysFromNow(-18),
      method: 'ACH •••• 7321',
      status: 'past_due',
      period: 'Current month',
      notes: 'ACH returned - insufficient funds',
    },
    {
      id: 'pay-03',
      invoice: 'INV-4019',
      accountId: 'acct-1003',
      customer: 'Brightline Retail',
      amount: 249,
      date: daysFromNow(-14),
      method: 'Mastercard •••• 1108',
      status: 'paid',
      period: 'Current month',
      notes: 'Includes 4 add-on seats',
    },
    {
      id: 'pay-04',
      invoice: 'INV-4018',
      accountId: 'acct-1005',
      customer: 'Northwind Supply',
      amount: 499,
      date: daysFromNow(-90),
      method: 'Wire',
      status: 'failed',
      period: 'Annual',
      notes: 'Payment attempt failed on renewal',
    },
    {
      id: 'pay-05',
      invoice: 'INV-4017',
      accountId: 'acct-1004',
      customer: 'Cedar & Pine Agency',
      amount: 0,
      date: daysFromNow(-30),
      method: 'Trial',
      status: 'pending',
      period: 'Trial',
      notes: 'Trial set to convert in October',
    },
  ]);

  private readonly plansSubject = new BehaviorSubject<BillingPlan[]>([
    {
      id: 'plan-launch',
      name: 'Launch',
      price: 119,
      cadence: 'monthly',
      seatsIncluded: 5,
      features: ['Single brand', 'Email support', 'Quarterly reports'],
      activeSubscribers: 14,
    },
    {
      id: 'plan-growth',
      name: 'Growth',
      price: 189,
      cadence: 'monthly',
      seatsIncluded: 10,
      features: ['Two brands', 'Live chat', 'Monthly reports'],
      activeSubscribers: 28,
    },
    {
      id: 'plan-scale',
      name: 'Scale',
      price: 449,
      cadence: 'monthly',
      seatsIncluded: 25,
      features: ['Unlimited brands', 'Priority SLAs', 'Dedicated CSM'],
      activeSubscribers: 9,
    },
  ]);

  readonly accounts$ = this.accountsSubject.asObservable();
  readonly payments$ = this.paymentsSubject.asObservable();
  readonly plans$ = this.plansSubject.asObservable();

  readonly summary$: Observable<BillingSummary> = combineLatest([
    this.accounts$,
    this.payments$,
  ]).pipe(
    map(([accounts, payments]) => {
      const activeAccounts = accounts.filter((acct) => acct.status === 'active').length;
      const trialing = accounts.filter((acct) => acct.status === 'trialing').length;
      const atRisk = accounts.filter((acct) => acct.status === 'past_due' || acct.outstandingBalance > 0).length;
      const mrr = accounts
        .filter((acct) => acct.status === 'active' || acct.status === 'trialing')
        .reduce((total, acct) => total + acct.mrr, 0);

      const monthlyCollected = payments
        .filter((payment) => payment.status === 'paid' && this.isInCurrentMonth(payment.date))
        .reduce((total, payment) => total + payment.amount, 0);

      const refunds = payments
        .filter((payment) => payment.status === 'refunded')
        .reduce((total, payment) => total + payment.amount, 0);

      return { activeAccounts, trialing, atRisk, mrr, monthlyCollected, refunds };
    })
  );

  addAccount(account: Omit<AccountRecord, 'id' | 'outstandingBalance' | 'lastPaymentDate'>): void {
    const newAccount: AccountRecord = {
      ...account,
      id: this.nextId('acct'),
      lastPaymentDate: new Date().toISOString().slice(0, 10),
      outstandingBalance: 0,
      tags: account.tags ?? [],
    };

    const updated = [...this.accountsSubject.getValue(), newAccount];
    this.accountsSubject.next(updated);
    this.refreshPlanSubscribers();
  }

  updateAccountStatus(accountId: string, status: AccountStatus): void {
    const updated = this.accountsSubject.getValue().map((acct) =>
      acct.id === accountId
        ? {
            ...acct,
            status,
          }
        : acct
    );

    this.accountsSubject.next(updated);
    this.refreshPlanSubscribers();
  }

  clearBalance(accountId: string): void {
    const updated = this.accountsSubject.getValue().map((acct) =>
      acct.id === accountId
        ? {
            ...acct,
            outstandingBalance: 0,
            status: acct.status === 'past_due' ? 'active' : acct.status,
            lastPaymentDate: new Date().toISOString().slice(0, 10),
          }
        : acct
    );

    this.accountsSubject.next(updated);
  }

  recordPayment(entry: PaymentInput): void {
    const accounts = this.accountsSubject.getValue();
    const account = accounts.find((acct) => acct.id === entry.accountId);

    if (!account) {
      return;
    }

    const payment: PaymentRecord = {
      id: this.nextId('pay'),
      accountId: account.id,
      customer: account.name,
      invoice: entry.invoice,
      amount: entry.amount,
      date: new Date().toISOString().slice(0, 10),
      method: entry.method,
      status: entry.status,
      period: entry.period,
      notes: entry.notes,
    };

    const updatedPayments = [payment, ...this.paymentsSubject.getValue()];
    this.paymentsSubject.next(updatedPayments);

    const adjustedAccounts = accounts.map((acct) => {
      if (acct.id !== account.id) {
        return acct;
      }

      const outstandingChange = this.getOutstandingDelta(entry.status, entry.amount);
      const newBalance = Math.max(acct.outstandingBalance + outstandingChange, 0);
      const nextStatus = this.getNextStatus(entry.status, newBalance, acct.status);

      return {
        ...acct,
        outstandingBalance: newBalance,
        lastPaymentDate: payment.date,
        status: nextStatus,
      };
    });

    this.accountsSubject.next(adjustedAccounts);
  }

  addPlan(plan: Omit<BillingPlan, 'id' | 'activeSubscribers'>): void {
    const newPlan: BillingPlan = {
      ...plan,
      id: this.nextId('plan'),
      activeSubscribers: 0,
    };

    this.plansSubject.next([...this.plansSubject.getValue(), newPlan]);
  }

  getAccount(accountId: string): AccountRecord | undefined {
    return this.accountsSubject.getValue().find((acct) => acct.id === accountId);
  }

  private refreshPlanSubscribers(): void {
    const accounts = this.accountsSubject.getValue();
    const refreshed = this.plansSubject.getValue().map((plan) => ({
      ...plan,
      activeSubscribers: accounts.filter(
        (acct) => acct.plan === plan.name && acct.status !== 'cancelled'
      ).length,
    }));

    this.plansSubject.next(refreshed);
  }

  private isInCurrentMonth(date: string): boolean {
    const parsed = new Date(date);
    const now = new Date();
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
  }

  private getOutstandingDelta(status: PaymentStatus, amount: number): number {
    if (status === 'paid' || status === 'refunded') {
      return status === 'paid' ? -amount : amount;
    }

    if (status === 'past_due' || status === 'failed') {
      return amount;
    }

    return 0;
  }

  private getNextStatus(status: PaymentStatus, outstanding: number, current: AccountStatus): AccountStatus {
    if (status === 'refunded') {
      return 'active';
    }

    if (status === 'paid' && outstanding === 0) {
      return current === 'trialing' ? 'active' : current;
    }

    if (status === 'failed' || status === 'past_due' || outstanding > 0) {
      return 'past_due';
    }

    return current;
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  }
}
