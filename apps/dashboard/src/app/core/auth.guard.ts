import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const status = this.auth.sessionStatus();

    if (status === 'valid') {
      return true;
    }

    const reason = this.auth.consumeLogoutReason() ?? (status === 'expired' ? 'expired' : 'unauthenticated');
    const queryParams: Record<string, string> = { reason };
    if (state.url && state.url !== '/') {
      queryParams['redirectTo'] = state.url;
    }

    return this.router.createUrlTree(['/auth'], { queryParams });
  }
}
