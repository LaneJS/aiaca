import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingDataService } from '../../services/billing-data.service';
import { AccountRecord, AccountStatus } from '../../types';

interface AccountFilters {
  search: string;
  status: 'all' | AccountStatus;
  plan: 'all' | string;
}

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent {
  private readonly billing = inject(BillingDataService);
  readonly filters$ = new BehaviorSubject<AccountFilters>({ search: '', status: 'all', plan: 'all' });
  filters: AccountFilters = this.filters$.getValue();

  readonly accounts$: Observable<AccountRecord[]> = combineLatest([
    this.billing.accounts$,
    this.filters$,
  ]).pipe(
    map(([accounts, filters]) =>
      accounts.filter((acct) => {
        const matchesSearch = `${acct.name} ${acct.email}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || acct.status === filters.status;
        const matchesPlan = filters.plan === 'all' || acct.plan === filters.plan;

        return matchesSearch && matchesStatus && matchesPlan;
      })
    )
  );

  newAccount: Partial<AccountRecord> = {
    name: '',
    email: '',
    plan: 'Launch',
    mrr: 0,
    seats: 1,
    status: 'trialing',
    renewsOn: new Date().toISOString().slice(0, 10),
    tags: [],
  };

  readonly planOptions = ['Launch', 'Growth', 'Scale'];
  readonly statusOptions: AccountStatus[] = ['active', 'trialing', 'past_due', 'paused', 'cancelled'];

  applyFilter(partial: Partial<AccountFilters>): void {
    this.filters = { ...this.filters, ...partial } as AccountFilters;
    this.filters$.next(this.filters);
  }

  resetFilters(): void {
    this.filters = { search: '', status: 'all', plan: 'all' };
    this.filters$.next(this.filters);
  }

  addAccount(): void {
    if (!this.newAccount.name || !this.newAccount.email || !this.newAccount.plan || !this.newAccount.status) {
      return;
    }

    const tags = Array.isArray(this.newAccount.tags)
      ? this.newAccount.tags
      : (this.newAccount.tags ?? '')
          .toString()
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    this.billing.addAccount({
      name: this.newAccount.name,
      email: this.newAccount.email,
      plan: this.newAccount.plan,
      mrr: Number(this.newAccount.mrr) || 0,
      seats: Number(this.newAccount.seats) || 1,
      status: this.newAccount.status,
      renewsOn: this.newAccount.renewsOn ?? new Date().toISOString().slice(0, 10),
      tags,
    });

    this.newAccount = {
      name: '',
      email: '',
      plan: 'Launch',
      mrr: 0,
      seats: 1,
      status: 'trialing',
      renewsOn: new Date().toISOString().slice(0, 10),
      tags: [],
    };
  }

  updateStatus(accountId: string, status: AccountStatus): void {
    this.billing.updateAccountStatus(accountId, status);
  }

  clearBalance(accountId: string): void {
    this.billing.clearBalance(accountId);
  }

  badgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-pill status-pill--success';
      case 'trialing':
        return 'status-pill status-pill--trial';
      case 'past_due':
        return 'status-pill status-pill--warning';
      case 'paused':
        return 'status-pill status-pill--muted';
      default:
        return 'status-pill';
    }
  }
}
