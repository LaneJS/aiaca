import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Account, AccountStatus, Charge, ChargeStatus, Subscription, SubscriptionStatus } from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';

interface DashboardSummary {
  activeAccounts: number;
  delinquentAccounts: number;
  subscriptionCount: number;
  monthlyCollected: number;
  refunds: number;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

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

  readonly charges$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading.track(this.api.listCharges({ page: 0, pageSize: 20 })).pipe(
        map((res) => res.items),
        catchError(() => {
          this.notifications.error('Unable to load payments');
          return of([] as Charge[]);
        })
      )
    ),
    shareReplay(1)
  );

  readonly subscriptions$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading.track(this.api.listSubscriptions({ status: SubscriptionStatus.ACTIVE, page: 0, pageSize: 50 })).pipe(
        map((res) => res.items),
        catchError(() => {
          this.notifications.error('Unable to load subscriptions');
          return of([] as Subscription[]);
        })
      )
    ),
    shareReplay(1)
  );

  readonly summary$ = combineLatest([this.accounts$, this.charges$, this.subscriptions$]).pipe(
    map(([accounts, charges, subscriptions]) => ({
      activeAccounts: accounts.filter((acct) => acct.status === AccountStatus.ACTIVE).length,
      delinquentAccounts: accounts.filter((acct) => acct.status === AccountStatus.DELINQUENT).length,
      subscriptionCount: subscriptions.length,
      monthlyCollected: charges
        .filter((charge) => charge.status === ChargeStatus.SUCCEEDED)
        .reduce((total, charge) => total + (charge.amount ?? 0), 0),
      refunds: charges.reduce((total, charge) => total + (charge.refundedAmount ?? 0), 0),
    }))
  );

  readonly upcomingRenewals$ = this.subscriptions$.pipe(
    map((subscriptions) =>
      subscriptions
        .filter((sub) => !!sub.currentPeriodEnd)
        .sort((a, b) => new Date(a.currentPeriodEnd ?? '').getTime() - new Date(b.currentPeriodEnd ?? '').getTime())
        .slice(0, 5)
    )
  );

  readonly upcomingRenewalsView$ = combineLatest([this.upcomingRenewals$, this.accounts$]).pipe(
    map(([subs, accounts]) =>
      subs.map((sub) => ({
        ...sub,
        accountName: accounts.find((acct) => acct.id === sub.accountId)?.name ?? 'Account',
      }))
    )
  );

  readonly atRiskAccounts$ = combineLatest([this.accounts$, this.subscriptions$]).pipe(
    map(([accounts, subscriptions]) => {
      const pastDueAccountIds = new Set(
        subscriptions.filter((sub) => sub.status === SubscriptionStatus.PAST_DUE).map((sub) => sub.accountId)
      );
      return accounts.filter(
        (acct) => acct.status === AccountStatus.DELINQUENT || (acct.id && pastDueAccountIds.has(acct.id))
      );
    })
  );

  readonly recentPayments$ = this.charges$.pipe(
    map((charges) =>
      [...charges].sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime()).slice(0, 5)
    )
  );

  readonly recentPaymentsView$ = combineLatest([this.recentPayments$, this.accounts$]).pipe(
    map(([charges, accounts]) =>
      charges.map((charge) => ({
        ...charge,
        accountName: accounts.find((acct) => acct.id === charge.accountId)?.name ?? 'Account',
      }))
    )
  );

  refresh(): void {
    this.refresh$.next();
    this.notifications.info('Refreshing billing data…', undefined, 2000);
  }

  statusClass(status: string): string {
    switch (status) {
      case AccountStatus.ACTIVE:
      case ChargeStatus.SUCCEEDED:
        return 'status-pill status-pill--success';
      case SubscriptionStatus.PAST_DUE:
      case AccountStatus.DELINQUENT:
      case ChargeStatus.FAILED:
        return 'status-pill status-pill--warning';
      default:
        return 'status-pill status-pill--muted';
    }
  }

  formatAmount(amount?: number, currency?: string): string {
    const safeAmount = amount ?? 0;
    const normalized = safeAmount / 100;
    const code = currency ?? 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(normalized);
  }
}
