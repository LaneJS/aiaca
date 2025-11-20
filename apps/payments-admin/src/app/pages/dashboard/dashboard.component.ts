import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingDataService } from '../../services/billing-data.service';
import { AccountRecord, BillingSummary, PaymentRecord } from '../../types';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  readonly summary$: Observable<BillingSummary> = this.billing.summary$;
  readonly upcomingRenewals$: Observable<AccountRecord[]> = this.billing.accounts$.pipe(
    map((accounts) =>
      [...accounts]
        .filter((acct) => acct.status !== 'cancelled')
        .sort((a, b) => new Date(a.renewsOn).getTime() - new Date(b.renewsOn).getTime())
        .slice(0, 4)
    )
  );

  readonly atRiskAccounts$: Observable<AccountRecord[]> = this.billing.accounts$.pipe(
    map((accounts) =>
      accounts
        .filter((acct) => acct.status === 'past_due' || acct.outstandingBalance > 0)
        .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
    )
  );

  readonly recentPayments$: Observable<PaymentRecord[]> = this.billing.payments$.pipe(
    map((payments) =>
      [...payments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    )
  );

  constructor(private readonly billing: BillingDataService) {}

  statusClass(status: string): string {
    switch (status) {
      case 'active':
      case 'paid':
        return 'status-pill status-pill--success';
      case 'trialing':
        return 'status-pill status-pill--trial';
      case 'past_due':
        return 'status-pill status-pill--warning';
      case 'paused':
        return 'status-pill status-pill--muted';
      case 'refunded':
        return 'status-pill status-pill--muted';
      default:
        return 'status-pill';
    }
  }
}
