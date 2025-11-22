import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { Account, Charge, ChargeStatus, Invoice, InvoiceStatus } from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';

interface PaymentFilters {
  status: 'all' | ChargeStatus;
  accountId: 'all' | string;
  search: string;
}

interface InvoiceFilters {
  status: 'all' | InvoiceStatus;
  accountId: 'all' | string;
}

type PaymentFormState = {
  accountId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
};

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent {
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly filters$ = new BehaviorSubject<PaymentFilters>({ status: 'all', accountId: 'all', search: '' });
  filters: PaymentFilters = this.filters$.getValue();
  readonly invoiceFilters$ = new BehaviorSubject<InvoiceFilters>({ status: 'all', accountId: 'all' });
  invoiceFilters: InvoiceFilters = this.invoiceFilters$.getValue();

  readonly chargesPageSize = 25;
  readonly invoicesPageSize = 25;
  private readonly chargePage$ = new BehaviorSubject(0);
  private readonly invoicePage$ = new BehaviorSubject(0);

  readonly paymentStatuses: ChargeStatus[] = [
    ChargeStatus.PENDING,
    ChargeStatus.SUCCEEDED,
    ChargeStatus.FAILED,
    ChargeStatus.REQUIRES_ACTION,
    ChargeStatus.REFUNDED,
    ChargeStatus.PARTIALLY_REFUNDED,
  ];
  readonly invoiceStatuses: InvoiceStatus[] = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.OPEN,
    InvoiceStatus.PAID,
    InvoiceStatus.PAST_DUE,
    InvoiceStatus.UNCOLLECTIBLE,
    InvoiceStatus.VOID,
  ];

  readonly accounts$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading.track(this.api.listAccounts({ page: 0, pageSize: 50 })).pipe(
        map((res) => res.items),
        catchError(() => {
          this.notifications.error('Unable to load accounts');
          return of([] as Account[]);
        })
      )
    ),
    shareReplay(1)
  );

  readonly paymentsPage$ = combineLatest([this.filters$, this.refresh$, this.chargePage$]).pipe(
    switchMap(([filters, , page]) =>
      this.loading
        .track(
          this.api.listCharges({
            accountId: filters.accountId === 'all' ? undefined : filters.accountId,
            status: filters.status === 'all' ? undefined : filters.status,
            page,
            pageSize: this.chargesPageSize,
          })
        )
        .pipe(
          map((res) => ({
            items: res.items.filter((payment) => {
              if (!filters.search) {
                return true;
              }
              const query = filters.search.toLowerCase();
              return `${payment.id} ${payment.invoiceId} ${payment.paymentMethodId ?? ''}`.toLowerCase().includes(query);
            }),
            total: res.total,
            page: res.page,
            pageSize: res.pageSize,
          })),
          catchError(() => {
            this.notifications.error('Unable to load payments');
            return of({ items: [] as Charge[], total: 0, page: 0, pageSize: this.chargesPageSize });
          })
        )
    ),
    shareReplay(1)
  );

  readonly paymentsView$ = combineLatest([this.paymentsPage$, this.accounts$]).pipe(
    map(([page, accounts]) =>
      ({
        ...page,
        items: page.items.map((payment) => ({
          ...payment,
          accountName: accounts.find((acct) => acct.id === payment.accountId)?.name ?? 'Account',
        })),
      })
    )
  );

  readonly invoicesPage$ = combineLatest([this.invoiceFilters$, this.refresh$, this.invoicePage$]).pipe(
    switchMap(([filters, , page]) =>
      this.loading
        .track(
          this.api.listInvoices({
            accountId: filters.accountId === 'all' ? undefined : filters.accountId,
            status: filters.status === 'all' ? undefined : filters.status,
            page,
            pageSize: this.invoicesPageSize,
          })
        )
        .pipe(
          catchError(() => {
            this.notifications.error('Unable to load invoices');
            return of({ items: [] as Invoice[], total: 0, page: 0, pageSize: this.invoicesPageSize });
          })
        )
    ),
    shareReplay(1)
  );

  readonly invoicesView$ = combineLatest([this.invoicesPage$, this.accounts$]).pipe(
    map(([page, accounts]) =>
      ({
        ...page,
        items: page.items.map((invoice) => ({
          ...invoice,
          accountName: accounts.find((acct) => acct.id === invoice.accountId)?.name ?? 'Account',
        })),
      })
    )
  );

  newPayment = signal<PaymentFormState>({
    accountId: '',
    invoiceId: '',
    amount: 0,
    currency: 'USD',
    paymentMethodId: '',
  });

  readonly ChargeStatus = ChargeStatus;
  readonly InvoiceStatus = InvoiceStatus;
  readonly chargeActionLoading = signal<Set<string>>(new Set());
  readonly invoiceActionLoading = signal<Set<string>>(new Set());

  applyFilter(partial: Partial<PaymentFilters>): void {
    this.filters = { ...this.filters, ...partial } as PaymentFilters;
    this.filters$.next(this.filters);
    this.chargePage$.next(0);
  }

  resetFilters(): void {
    this.filters = { status: 'all', accountId: 'all', search: '' };
    this.filters$.next(this.filters);
    this.chargePage$.next(0);
  }

  recordPayment(): void {
    const payload = this.newPayment();
    if (!payload.accountId || !payload.amount) {
      this.notifications.warning('Account and amount are required');
      return;
    }

    this.loading
      .track(
        this.api.createCharge({
          accountId: payload.accountId,
          invoiceId: payload.invoiceId || undefined,
          paymentMethodId: payload.paymentMethodId || undefined,
          amount: Math.round(Number(payload.amount) * 100),
          currency: payload.currency,
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Charge recorded');
          this.resetPaymentForm();
          this.refresh$.next();
        },
        error: () => this.notifications.error('Unable to record payment'),
      });
  }

  changeChargePage(delta: number): void {
    const next = Math.max(0, this.chargePage$.value + delta);
    this.chargePage$.next(next);
  }

  changeInvoicePage(delta: number): void {
    const next = Math.max(0, this.invoicePage$.value + delta);
    this.invoicePage$.next(next);
  }

  applyInvoiceFilter(partial: Partial<InvoiceFilters>): void {
    this.invoiceFilters = { ...this.invoiceFilters, ...partial } as InvoiceFilters;
    this.invoiceFilters$.next(this.invoiceFilters);
    this.invoicePage$.next(0);
  }

  private resetPaymentForm(): void {
    this.newPayment.set({ accountId: '', invoiceId: '', amount: 0, currency: 'USD', paymentMethodId: '' });
  }

  private patchPayment(update: Partial<PaymentFormState>): void {
    this.newPayment.update((curr) => ({ ...curr, ...update }));
  }

  setPaymentInvoiceId(value: string): void {
    this.patchPayment({ invoiceId: value });
  }

  setPaymentAmount(value: string | number | null): void {
    const numeric = value === null || value === '' ? 0 : Number(value);
    this.patchPayment({ amount: Number.isFinite(numeric) ? (numeric as number) : 0 });
  }

  setPaymentCurrency(value: string): void {
    this.patchPayment({ currency: value });
  }

  setPaymentMethodId(value: string): void {
    this.patchPayment({ paymentMethodId: value });
  }

  setPaymentAccount(value: string): void {
    this.patchPayment({ accountId: value });
  }

  updateStatus(chargeId: string | undefined, status: ChargeStatus): void {
    if (!chargeId) {
      return;
    }
    const text = `Set charge ${chargeId} to ${status}. This may retry collection or mark it closed. Proceed?`;
    if (!window.confirm(text)) {
      return;
    }
    this.chargeActionLoading.update((set) => new Set(set).add(chargeId));
    this.loading
      .track(this.api.updateChargeStatus(chargeId, { status }))
      .pipe(
        finalize(() =>
          this.chargeActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(chargeId);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Payment status updated');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Failed to update payment status'),
      });
  }

  issueRefund(charge: Charge): void {
    if (!charge.id) {
      return;
    }
    if (!window.confirm(`Issue refund for ${this.formatAmount(charge.amount, charge.currency)}?`)) {
      return;
    }
    this.chargeActionLoading.update((set) => new Set(set).add(charge.id as string));
    this.loading
      .track(this.api.createRefund(charge.id, { amount: charge.amount ?? 0 }))
      .pipe(
        finalize(() =>
          this.chargeActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(charge.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Refund issued');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Refund failed'),
      });
  }

  markOfflinePayment(invoice: Invoice): void {
    if (!invoice.id || !invoice.total) {
      this.notifications.warning('Invoice total is required');
      return;
    }
    if (!window.confirm(`Mark invoice ${invoice.number || invoice.id} as paid offline?`)) {
      return;
    }
    this.invoiceActionLoading.update((set) => new Set(set).add(invoice.id as string));
    this.loading
      .track(
        this.api.createCharge({
          accountId: invoice.accountId,
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
        })
      )
      .pipe(
        finalize(() =>
          this.invoiceActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(invoice.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Offline payment recorded');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Failed to record offline payment'),
      });
  }

  issueCreditNote(invoice: Invoice): void {
    if (!invoice.id || !invoice.total) {
      return;
    }
    const creditAmount = invoice.total;
    if (!window.confirm(`Issue credit note for ${this.formatAmount(creditAmount, invoice.currency)}?`)) {
      return;
    }
    this.invoiceActionLoading.update((set) => new Set(set).add(invoice.id as string));
    this.loading
      .track(this.api.createCreditNote(invoice.id, { amount: creditAmount }))
      .pipe(
        finalize(() =>
          this.invoiceActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(invoice.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Credit note issued');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Credit note failed'),
      });
  }

  formatAmount(amount?: number, currency?: string): string {
    const value = amount ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value / 100);
  }

  statusClass(status: string): string {
    switch (status) {
      case ChargeStatus.SUCCEEDED:
        return 'status-pill status-pill--success';
      case ChargeStatus.REFUNDED:
      case ChargeStatus.PARTIALLY_REFUNDED:
        return 'status-pill status-pill--muted';
      case ChargeStatus.FAILED:
      case ChargeStatus.REQUIRES_ACTION:
        return 'status-pill status-pill--warning';
      default:
        return 'status-pill';
    }
  }
}
