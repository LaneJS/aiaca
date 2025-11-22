import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../state/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notifications.error('Session expired. Please sign in again.');
        auth.handleAuthFailure();
      } else if (error.status === 403) {
        notifications.warning('You do not have permission to perform this action.');
      } else if (error.error?.message) {
        notifications.error(error.error.message);
      } else {
        notifications.error('Request failed. Please try again.');
      }

      return throwError(() => error);
    })
  );
};
