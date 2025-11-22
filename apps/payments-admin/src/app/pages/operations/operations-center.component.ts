import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  Dispute,
  DisputeStatus,
  DunningEventStatus,
  Invoice,
  InvoiceStatus,
  WebhookEvent,
  WebhookEventStatus,
} from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';

interface DunningRow {
  invoice: Invoice;
  status: InvoiceStatus | string;
}

@Component({
  selector: 'app-operations-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operations-center.component.html',
  styleUrls: ['./operations-center.component.scss'],
})
export class OperationsCenterComponent {
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);
  readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly disputeStatus = DisputeStatus;
  readonly webhookStatus = WebhookEventStatus;
  readonly invoiceStatus = InvoiceStatus;

  readonly disputes$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listDisputes({ page: 0, pageSize: 100 }))
        .pipe(
          catchError(() => {
            this.notifications.error('Unable to load disputes');
            return of({ items: [] as Dispute[], total: 0, page: 0, pageSize: 0 });
          })
        )
    ),
    shareReplay(1)
  );

  readonly webhooks$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listWebhookEvents({ page: 0, pageSize: 100 }))
        .pipe(
          catchError(() => {
            this.notifications.error('Unable to load webhook events');
            return of({ items: [] as WebhookEvent[], total: 0, page: 0, pageSize: 0 });
          })
        )
    ),
    shareReplay(1)
  );

  readonly dunningQueue$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listDunningQueue())
        .pipe(
          map((invoices) => invoices.map((invoice) => ({ invoice, status: invoice.status } as DunningRow))),
          catchError(() => {
            this.notifications.error('Unable to load dunning queue');
            return of([] as DunningRow[]);
          })
        )
    ),
    shareReplay(1)
  );

  readonly disputeActionLoading = signal<Set<string>>(new Set());
  readonly webhookActionLoading = signal<Set<string>>(new Set());

  refresh(): void {
    this.refresh$.next();
  }

  markDispute(dispute: Dispute, status: DisputeStatus): void {
    if (!dispute.id || dispute.status === status) {
      return;
    }
    if (!window.confirm(`Update dispute ${dispute.id} to ${status}?`)) {
      return;
    }
    this.disputeActionLoading.update((set) => new Set(set).add(dispute.id as string));
    this.loading
      .track(this.api.updateDispute(dispute.id, { status }))
      .pipe(
        finalize(() =>
          this.disputeActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(dispute.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Dispute updated');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Failed to update dispute'),
      });
  }

  recordDunningTouch(row: DunningRow): void {
    const invoiceId = row.invoice.id;
    if (!invoiceId) {
      return;
    }
    this.loading
      .track(
        this.api.recordDunningEvent({
          accountId: row.invoice.accountId,
          invoiceId: invoiceId as string,
          status: DunningEventStatus.PENDING,
          stepName: 'Manual outreach',
          channel: 'email',
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Dunning note recorded');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Failed to record dunning note'),
      });
  }

  retryWebhook(event: WebhookEvent): void {
    if (!event.id) {
      return;
    }
    if (!window.confirm(`Mark webhook ${event.eventId} for retry?`)) {
      return;
    }
    this.webhookActionLoading.update((set) => new Set(set).add(event.id as string));
    this.loading
      .track(this.api.updateWebhookStatus(event.id, WebhookEventStatus.RETRYING))
      .pipe(
        finalize(() =>
          this.webhookActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(event.id as string);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Webhook marked for retry');
          this.refresh$.next();
        },
        error: () => this.notifications.error('Failed to mark webhook'),
      });
  }

  formatAmount(amount?: number, currency?: string): string {
    const value = amount ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value / 100);
  }
}
