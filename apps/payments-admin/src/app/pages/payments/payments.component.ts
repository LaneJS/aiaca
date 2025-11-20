import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { BillingDataService } from '../../services/billing-data.service';
import { AccountRecord, PaymentRecord, PaymentStatus } from '../../types';

interface PaymentFilters {
  status: 'all' | PaymentStatus;
  method: string;
  search: string;
}

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  private readonly billing = inject(BillingDataService);
  readonly filters$ = new BehaviorSubject<PaymentFilters>({ status: 'all', method: 'all', search: '' });
  filters: PaymentFilters = this.filters$.getValue();
  readonly paymentStatuses: PaymentStatus[] = ['paid', 'refunded', 'failed', 'past_due', 'pending'];

  readonly payments$: Observable<PaymentRecord[]> = combineLatest([
    this.billing.payments$,
    this.filters$,
  ]).pipe(
    map(([payments, filters]) =>
      payments.filter((payment) => {
        const matchesStatus = filters.status === 'all' || payment.status === filters.status;
        const matchesMethod = filters.method === 'all' || payment.method.includes(filters.method);
        const matchesSearch = `${payment.customer} ${payment.invoice}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());

        return matchesStatus && matchesMethod && matchesSearch;
      })
    )
  );

  readonly accounts$: Observable<AccountRecord[]> = this.billing.accounts$;

  newPayment: Partial<PaymentRecord> & { accountId?: string } = {
    invoice: 'INV-',
    amount: 0,
    method: 'Card',
    status: 'paid',
    period: 'Monthly',
  };

  ngOnInit(): void {
    this.accounts$.pipe(take(1)).subscribe((accounts) => {
      if (!this.newPayment.accountId && accounts.length > 0) {
        this.newPayment.accountId = accounts[0].id;
      }
    });
  }

  applyFilter(partial: Partial<PaymentFilters>): void {
    this.filters = { ...this.filters, ...partial } as PaymentFilters;
    this.filters$.next(this.filters);
  }

  recordPayment(): void {
    if (!this.newPayment.accountId || !this.newPayment.invoice) {
      return;
    }

    this.billing.recordPayment({
      accountId: this.newPayment.accountId,
      invoice: this.newPayment.invoice,
      amount: Number(this.newPayment.amount) || 0,
      method: this.newPayment.method ?? 'Card',
      status: (this.newPayment.status as PaymentStatus) ?? 'paid',
      period: this.newPayment.period ?? 'Monthly',
      notes: this.newPayment.notes,
    });

    this.newPayment = {
      invoice: 'INV-',
      amount: 0,
      method: 'Card',
      status: 'paid',
      period: 'Monthly',
    };
  }

  badgeClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'status-pill status-pill--success';
      case 'refunded':
        return 'status-pill status-pill--muted';
      case 'failed':
      case 'past_due':
        return 'status-pill status-pill--warning';
      default:
        return 'status-pill';
    }
  }
}
