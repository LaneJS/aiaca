import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserProfile } from './models';

export type SubscriptionStatus = UserProfile['subscriptionStatus'];

@Injectable({ providedIn: 'root' })
export class SubscriptionStateService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly statusSignal = signal<SubscriptionStatus | null>(this.auth.user()?.subscriptionStatus ?? null);

  readonly status = this.statusSignal.asReadonly();

  refresh(): Observable<SubscriptionStatus | null> {
    return this.api.getSubscriptionStatus().pipe(
      map((response) => response.status as SubscriptionStatus),
      tap((status) => {
        this.statusSignal.set(status);
        this.auth.updateSubscriptionStatus(status);
      }),
      catchError(() => of(this.statusSignal()))
    );
  }

  isActive(status: SubscriptionStatus | null = this.statusSignal()): boolean {
    return status === 'ACTIVE' || status === 'TRIALING';
  }

  isReadOnly(status: SubscriptionStatus | null = this.statusSignal()): boolean {
    if (!status) {
      return false;
    }
    return !this.isActive(status);
  }
}
