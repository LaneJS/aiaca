import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

export const roleGuard: CanMatchFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data?.['roles'] as UserRole[]) ?? [];

  if (!requiredRoles.length) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  if (auth.hasRole(requiredRoles)) {
    return true;
  }

  return router.parseUrl('/unauthorized');
};
