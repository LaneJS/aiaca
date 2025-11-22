import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { AuthService } from '../auth/auth.service';

const isApiUrl = (url: string, baseUrl: string): boolean => {
  if (url.startsWith('http')) {
    return url.includes(baseUrl);
  }

  return url.startsWith('/api');
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const config = inject(APP_CONFIG);
  const token = auth.token();

  if (!token || !isApiUrl(req.url, config.apiBaseUrl)) {
    return next(req);
  }

  const withAuth = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(withAuth);
};
