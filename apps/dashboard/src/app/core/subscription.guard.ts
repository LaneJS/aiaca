import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SubscriptionStateService } from './subscription-state.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionGuard implements CanActivate {
  private readonly subscriptions = inject(SubscriptionStateService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const allowReadOnly = route.data['allowReadOnly'] === true;
    const requiresActive = route.data['requiresActive'] === true;

    return this.subscriptions.refresh().pipe(
      map((status) => {
        const resolved = status ?? this.subscriptions.status();
        if (this.subscriptions.isActive(resolved)) {
          return true;
        }
        if (resolved === 'PAST_DUE') {
          return requiresActive
            ? this.router.createUrlTree(['/account'], { queryParams: { billing: 'required', redirectTo: state.url } })
            : true;
        }
        if (allowReadOnly) {
          return true;
        }
        return this.router.createUrlTree(['/account'], {
          queryParams: { billing: 'required', redirectTo: state.url }
        });
      }),
      catchError(() => {
        if (allowReadOnly) {
          return of(true);
        }
        return of(
          this.router.createUrlTree(['/account'], {
            queryParams: { billing: 'required', redirectTo: state.url }
          })
        );
      })
    );
  }
}
