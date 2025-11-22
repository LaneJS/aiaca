import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  Account,
  AccountStatus,
  AuditLog,
  ChargeStatus,
  Contact,
  DunningEvent,
  DunningEventStatus,
  Invoice,
  PaymentMethod,
  PaymentMethodStatus,
  Subscription,
  SubscriptionStatus,
} from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';
import { AuthService } from '../../core/auth/auth.service';

type PaymentMethodFormState = {
  brand: string;
  last4: string;
  expMonth: string | number;
  expYear: string | number;
  billingName: string;
};

type TabKey = 'overview' | 'contacts' | 'payment-methods' | 'subscriptions' | 'invoices' | 'dunning' | 'audit';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);
  private readonly auth = inject(AuthService);
  private readonly paymentMethodsRefresh$ = new BehaviorSubject<void>(undefined);

  readonly selectedTab = signal<TabKey>('overview');
  readonly tabs: TabKey[] = ['overview', 'contacts', 'payment-methods', 'subscriptions', 'invoices', 'dunning', 'audit'];
  readonly localNotes = signal<{ text: string; createdAt: Date }[]>([]);
  readonly showAddPaymentForm = signal(false);
  readonly newPaymentMethod = signal<PaymentMethodFormState>({
    brand: '',
    last4: '',
    expMonth: '',
    expYear: '',
    billingName: '',
  });
  readonly paymentMethodActionLoading = signal<Set<string>>(new Set());

  private readonly accountId$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (!id) {
        this.notifications.error('Account not found');
        return of(null);
      }
      return of(id);
    }),
    shareReplay(1)
  );

  readonly account$ = this.accountId$.pipe(
    switchMap((id) => {
      if (!id) {
        return of(null);
      }
      return this.loading.track(this.api.getAccount(id)).pipe(
        catchError(() => {
          this.notifications.error('Unable to load account');
          return of(null);
        })
      );
    }),
    shareReplay(1)
  );

  readonly contacts$ = this.accountId$.pipe(
    switchMap((id) => (id ? this.loading.track(this.api.listContacts(id)) : of([] as Contact[]))),
    catchError(() => of([] as Contact[])),
    shareReplay(1)
  );

  readonly paymentMethods$ = combineLatest([this.accountId$, this.paymentMethodsRefresh$]).pipe(
    switchMap(([id]) => (id ? this.loading.track(this.api.listPaymentMethods(id)) : of([] as PaymentMethod[]))),
    catchError(() => of([] as PaymentMethod[])),
    shareReplay(1)
  );

  readonly subscriptions$ = this.accountId$.pipe(
    switchMap((id) =>
      id
        ? this.loading
            .track(this.api.listSubscriptions({ accountId: id, page: 0, pageSize: 20 }))
            .pipe(map((res) => res.items))
        : of([] as Subscription[])
    ),
    catchError(() => of([] as Subscription[])),
    shareReplay(1)
  );

  readonly invoices$ = this.accountId$.pipe(
    switchMap((id) =>
      id
        ? this.loading
            .track(this.api.listInvoices({ accountId: id, page: 0, pageSize: 30 }))
            .pipe(map((res) => res.items))
        : of([] as Invoice[])
    ),
    catchError(() => of([] as Invoice[])),
    shareReplay(1)
  );

  readonly dunningEvents$ = this.accountId$.pipe(
    switchMap((id) =>
      this.loading.track(this.api.listDunningEvents()).pipe(
        map((events) => events.filter((event) => event.accountId === id)),
        catchError(() => of([] as DunningEvent[]))
      )
    ),
    shareReplay(1)
  );

  readonly auditLogs$ = this.accountId$.pipe(
    switchMap((id) =>
      id
        ? this.loading
            .track(this.api.listAuditLogs({ accountId: id, page: 0, pageSize: 50 }))
            .pipe(map((res) => res.items))
        : of([] as AuditLog[])
    ),
    catchError(() => of([] as AuditLog[])),
    shareReplay(1)
  );

  readonly overview$ = combineLatest([this.account$, this.subscriptions$, this.invoices$]).pipe(
    map(([account, subs, invoices]) => {
      const pastDueSubs = subs.filter((sub) => sub.status === SubscriptionStatus.PAST_DUE).length;
      const unpaidInvoices = invoices.filter(
        (inv) => inv.status && ['OPEN', 'PAST_DUE', 'UNCOLLECTIBLE'].includes(inv.status)
      ).length;
      return { account, pastDueSubs, unpaidInvoices };
    })
  );

  readonly canEdit = computed(() => this.auth.hasRole(['ADMIN', 'OPERATOR']));

  changeTab(tab: TabKey): void {
    this.selectedTab.set(tab);
    queueMicrotask(() => {
      document.getElementById(`tab-panel-${tab}`)?.focus();
    });
  }

  addNote(textarea: HTMLTextAreaElement): void {
    const text = textarea.value.trim();
    if (!text) {
      return;
    }
    this.localNotes.update((notes) => [{ text, createdAt: new Date() }, ...notes]);
    textarea.value = '';
    textarea.focus();
  }

  statusClass(status: AccountStatus | SubscriptionStatus | ChargeStatus | string | undefined): string {
    switch (status) {
      case AccountStatus.ACTIVE:
      case SubscriptionStatus.ACTIVE:
      case ChargeStatus.SUCCEEDED:
        return 'status-pill status-pill--success';
      case AccountStatus.DELINQUENT:
      case SubscriptionStatus.PAST_DUE:
      case ChargeStatus.FAILED:
        return 'status-pill status-pill--warning';
      default:
        return 'status-pill status-pill--muted';
    }
  }

  formatAmount(amount?: number, currency?: string): string {
    const value = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value / 100);
  }

  addPaymentMethod(accountId: string | null | undefined): void {
    if (!accountId) {
      return;
    }
    const payload = this.newPaymentMethod();
    if (!payload.last4 || !payload.expMonth || !payload.expYear) {
      this.notifications.warning('Enter brand, last4, and expiry');
      return;
    }
    this.paymentMethodActionLoading.update((set) => new Set(set).add('create'));
    this.loading
      .track(
        this.api.addPaymentMethod(accountId, {
          type: 'CARD' as any,
          status: PaymentMethodStatus.ACTIVE,
          brand: payload.brand,
          last4: payload.last4,
          expMonth: Number(payload.expMonth),
          expYear: Number(payload.expYear),
          billingName: payload.billingName,
          defaultMethod: false,
        })
      )
      .pipe(
        finalize(() =>
          this.paymentMethodActionLoading.update((set) => {
            const next = new Set(set);
            next.delete('create');
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Payment method added');
          this.resetPaymentMethodForm();
          this.paymentMethodsRefresh$.next();
          this.showAddPaymentForm.set(false);
        },
        error: () => this.notifications.error('Failed to add payment method'),
      });
  }

  setPaymentBillingName(value: string): void {
    this.patchPaymentMethod({ billingName: value });
  }

  setPaymentBrand(value: string): void {
    this.patchPaymentMethod({ brand: value });
  }

  setPaymentLast4(value: string): void {
    this.patchPaymentMethod({ last4: value });
  }

  setPaymentExpMonth(value: string | number | null): void {
    const numeric = value === null || value === '' ? '' : Number(value);
    this.patchPaymentMethod({ expMonth: Number.isFinite(numeric as number) ? (numeric as number) : '' });
  }

  setPaymentExpYear(value: string | number | null): void {
    const numeric = value === null || value === '' ? '' : Number(value);
    this.patchPaymentMethod({ expYear: Number.isFinite(numeric as number) ? (numeric as number) : '' });
  }

  setDefaultMethod(accountId: string | undefined, method: PaymentMethod): void {
    if (!accountId || !method.id) {
      return;
    }
    this.paymentMethodActionLoading.update((set) => new Set(set).add(method.id as string));
    this.loading
      .track(
        this.api.updatePaymentMethod(accountId, method.id as string, {
          type: method.type,
          status: method.status,
          brand: method.brand,
          last4: method.last4,
          expMonth: method.expMonth ?? undefined,
          expYear: method.expYear ?? undefined,
          billingName: method.billingName ?? undefined,
          stripePaymentMethodId: method.stripePaymentMethodId ?? undefined,
          defaultMethod: true,
        })
      )
      .pipe(
        finalize(() =>
          this.paymentMethodActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(method.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Default payment method updated');
          this.paymentMethodsRefresh$.next();
        },
        error: () => this.notifications.error('Failed to update payment method'),
        complete: () => this.paymentMethodsRefresh$.next(),
      });
  }

  removePaymentMethod(accountId: string | undefined, method: PaymentMethod): void {
    if (!accountId || !method.id) {
      return;
    }
    if (!window.confirm('Remove this payment method?')) {
      return;
    }
    this.paymentMethodActionLoading.update((set) => new Set(set).add(method.id as string));
    this.loading
      .track(this.api.deletePaymentMethod(accountId, method.id as string))
      .pipe(
        finalize(() =>
          this.paymentMethodActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(method.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Payment method removed');
          this.paymentMethodsRefresh$.next();
        },
        error: () => this.notifications.error('Failed to remove payment method'),
      });
  }

  private resetPaymentMethodForm(): void {
    this.newPaymentMethod.set({ brand: '', last4: '', expMonth: '', expYear: '', billingName: '' });
  }

  private patchPaymentMethod(update: Partial<PaymentMethodFormState>): void {
    this.newPaymentMethod.update((curr) => ({ ...curr, ...update }));
  }
}
