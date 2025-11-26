import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { getApiBaseUrl } from '@aiaca/config';

export interface RegisterCheckoutRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterCheckoutResponse {
  userId: string;
  checkoutUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBase = getApiBaseUrl();
  private readonly http = inject(HttpClient);

  registerCheckout(email: string, password: string, name?: string): Observable<RegisterCheckoutResponse> {
    const endpoint = `${this.apiBase}/auth/register-checkout`;
    return this.http.post<RegisterCheckoutResponse>(endpoint, { email, password, name }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
