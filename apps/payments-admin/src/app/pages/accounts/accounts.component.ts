import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Account, AccountStatus } from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';

interface AccountFilters {
  search: string;
  status: 'all' | AccountStatus;
  currency: 'all' | string;
}

type SortField = 'name' | 'createdAt' | 'status';

type AccountFormState = {
  name: string;
  currency: string;
  primaryContactEmail: string;
  taxExempt: boolean;
  status: AccountStatus;
};

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent {
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);

  readonly filters$ = new BehaviorSubject<AccountFilters>({ search: '', status: 'all', currency: 'all' });
  filters: AccountFilters = this.filters$.getValue();
  readonly sort = signal<{ field: SortField; direction: 'asc' | 'desc' }>({ field: 'createdAt', direction: 'desc' });
  readonly selected = signal<Set<string>>(new Set());

  readonly accountsPage$ = this.filters$.pipe(
    switchMap((filters) =>
      this.loading.track(
        this.api.listAccounts({
          search: filters.search || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          currency: filters.currency === 'all' ? undefined : filters.currency,
          page: 0,
          pageSize: 50,
        })
      ).pipe(
        catchError(() => {
          this.notifications.error('Unable to load accounts');
          return of({ items: [], total: 0, page: 0, pageSize: 50 });
        })
      )
    ),
    shareReplay(1)
  );

  readonly accounts$ = this.accountsPage$.pipe(map((res) => res.items));

  readonly displayAccounts$ = combineLatest([this.accounts$, toObservable(this.sort)]).pipe(
    map(([accounts, sort]) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      return [...accounts].sort((a, b) => {
        if (sort.field === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        if (sort.field === 'status') {
          return (a.status || '').localeCompare(b.status || '') * dir;
        }
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (aDate - bDate) * dir;
      });
    })
  );

  newAccount = signal<AccountFormState>({
    name: '',
    currency: 'USD',
    primaryContactEmail: '',
    taxExempt: false,
    status: AccountStatus.ACTIVE,
  });

  readonly statusOptions: AccountStatus[] = [
    AccountStatus.ACTIVE,
    AccountStatus.DELINQUENT,
    AccountStatus.SUSPENDED,
    AccountStatus.CLOSED,
  ];
  readonly AccountStatus = AccountStatus;

  applyFilter(partial: Partial<AccountFilters>): void {
    this.filters = { ...this.filters, ...partial } as AccountFilters;
    this.filters$.next(this.filters);
    this.clearSelection();
  }

  resetFilters(): void {
    this.filters = { search: '', status: 'all', currency: 'all' };
    this.filters$.next(this.filters);
    this.clearSelection();
  }

  setAccountName(value: string): void {
    this.patchAccount({ name: value });
  }

  setAccountEmail(value: string): void {
    this.patchAccount({ primaryContactEmail: value });
  }

  setAccountCurrency(value: string): void {
    this.patchAccount({ currency: value });
  }

  setAccountStatus(value: AccountStatus | string): void {
    this.patchAccount({ status: value as AccountStatus });
  }

  setAccountTaxExempt(value: boolean | string): void {
    const bool = typeof value === 'string' ? value === 'true' || value === 'on' : !!value;
    this.patchAccount({ taxExempt: bool });
  }

  changeSort(field: SortField): void {
    this.sort.update((current) => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  createAccount(): void {
    const payload = this.newAccount();
    if (!payload.name) {
      this.notifications.warning('Account name is required');
      return;
    }

    const { status, ...request } = payload;
    this.loading
      .track(this.api.createAccount(request))
      .pipe(
        switchMap((account) =>
          status && status !== AccountStatus.ACTIVE
            ? this.api.updateAccount(account.id, { status })
            : of(account)
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Account created');
          this.resetAccountForm();
          this.filters$.next(this.filters);
        },
        error: () => {
          this.notifications.error('Unable to create account');
        },
      });
  }

  updateStatus(accountId: string | undefined, status: AccountStatus): void {
    if (!accountId) {
      return;
    }
    this.loading.track(this.api.updateAccount(accountId, { status })).subscribe({
      next: () => {
        this.notifications.success('Account status updated');
        this.filters$.next(this.filters);
      },
      error: () => this.notifications.error('Failed to update account status'),
    });
  }

  toggleSelection(accountId: string | undefined, checked: boolean): void {
    if (!accountId) {
      return;
    }
    this.selected.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(accountId);
      } else {
        next.delete(accountId);
      }
      return next;
    });
  }

  selectAll(accounts: Account[]): void {
    const ids = accounts.map((acct) => acct.id).filter(Boolean) as string[];
    this.selected.set(new Set(ids));
  }

  private resetAccountForm(): void {
    this.newAccount.set({
      name: '',
      currency: 'USD',
      primaryContactEmail: '',
      taxExempt: false,
      status: AccountStatus.ACTIVE,
    });
  }

  private patchAccount(update: Partial<AccountFormState>): void {
    this.newAccount.update((curr) => ({ ...curr, ...update }));
  }

  clearSelection(): void {
    this.selected.set(new Set());
  }

  bulkFlag(): void {
    const count = this.selected().size;
    if (count === 0) {
      this.notifications.warning('Select at least one account');
      return;
    }
    this.notifications.info(`Bulk action placeholder for ${count} accounts`);
  }

  badgeClass(status: string): string {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'status-pill status-pill--success';
      case AccountStatus.DELINQUENT:
        return 'status-pill status-pill--warning';
      default:
        return 'status-pill status-pill--muted';
    }
  }
}
