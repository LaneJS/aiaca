import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  const target = '/' + segments.map((segment) => segment.path).filter(Boolean).join('/');
  if (target && target !== '/') {
    auth.setRedirect(target);
    return router.parseUrl(`/login?returnUrl=${encodeURIComponent(target)}`);
  }

  return router.parseUrl('/login');
};
