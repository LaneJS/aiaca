import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle authentication failures (expired/invalid token, not logged in)
        // 401 = Unauthorized (authentication required)
        // Note: Avoid handling auth endpoints to prevent logout loops
        if (error.status === 401 && !req.url.includes('/auth/')) {
          console.warn('[AuthInterceptor] Authentication failed (401). Logging out user.');
          this.auth.logout('expired'); // Clears session and redirects to /auth
        }

        return throwError(() => error);
      })
    );
  }
}
