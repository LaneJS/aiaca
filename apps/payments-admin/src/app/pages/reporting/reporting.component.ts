import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Account, AuditLog, Charge, ChargeStatus, Invoice, InvoiceStatus } from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { LoadingService } from '../../core/state/loading.service';
import { NotificationService } from '../../core/state/notification.service';

interface Summary {
  collected: number;
  refunds: number;
  failed: number;
  openInvoices: number;
  pastDueInvoices: number;
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss'],
})
export class ReportingComponent {
  private readonly api = inject(BillingApiService);
  private readonly loading = inject(LoadingService);
  private readonly notifications = inject(NotificationService);

  readonly refresh$ = new BehaviorSubject<void>(undefined);
  readonly auditPage$ = new BehaviorSubject(0);
  readonly filters = signal<{ accountId: 'all' | string }>({ accountId: 'all' });

  readonly accounts$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading.track(this.api.listAccounts({ page: 0, pageSize: 100 })).pipe(
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
      this.loading.track(this.api.listCharges({ page: 0, pageSize: 200 })).pipe(
        map((res) => res.items),
        catchError(() => {
          this.notifications.error('Unable to load payments');
          return of([] as Charge[]);
        })
      )
    ),
    shareReplay(1)
  );

  readonly invoices$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading.track(this.api.listInvoices({ page: 0, pageSize: 200 })).pipe(
        map((res) => res.items),
        catchError(() => {
          this.notifications.error('Unable to load invoices');
          return of([] as Invoice[]);
        })
      )
    ),
    shareReplay(1)
  );

  readonly summary$ = combineLatest([this.charges$, this.invoices$]).pipe(
    map(([charges, invoices]) => {
      const collected = charges
        .filter((c) => c.status === ChargeStatus.SUCCEEDED)
        .reduce((sum, c) => sum + (c.amount ?? 0), 0);
      const refunds = charges.reduce((sum, c) => sum + (c.refundedAmount ?? 0), 0);
      const failed = charges.filter((c) => c.status === ChargeStatus.FAILED).length;
      const openInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.OPEN).length;
      const pastDueInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.PAST_DUE).length;
      return { collected, refunds, failed, openInvoices, pastDueInvoices } as Summary;
    })
  );

  readonly auditLogs$ = combineLatest([toObservable(this.filters), this.auditPage$, this.refresh$]).pipe(
    switchMap(([filters, page, _refresh]) =>
      this.loading
        .track(
          this.api.listAuditLogs({
            accountId: filters.accountId === 'all' ? undefined : filters.accountId,
            page,
            pageSize: 50,
          })
        )
        .pipe(
          catchError(() => {
            this.notifications.error('Unable to load audit logs');
            return of({ items: [] as AuditLog[], total: 0, page: 0, pageSize: 50 });
          })
        )
    ),
    shareReplay(1)
  );

  changeAuditPage(delta: number): void {
    const next = Math.max(0, this.auditPage$.value + delta);
    this.auditPage$.next(next);
  }

  applyAccountFilter(accountId: 'all' | string): void {
    this.filters.set({ accountId });
    this.auditPage$.next(0);
  }

  refresh(): void {
    this.refresh$.next();
  }

  formatAmount(amount?: number, currency?: string): string {
    const value = amount ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value / 100);
  }

  exportPlaceholder(kind: 'payments' | 'invoices' | 'audit'): void {
    this.notifications.info(`Export ${kind} placeholder — hook to backend export endpoint`, undefined, 2500);
  }
}
