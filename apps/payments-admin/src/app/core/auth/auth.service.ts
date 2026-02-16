import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AuthResponse, AuthSession, LoginRequest, UserRole } from './auth.models';
import { AuthTokenStorage } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(AuthTokenStorage);
  private readonly config = inject(APP_CONFIG);

  private readonly sessionSignal = signal<AuthSession | null>(null);
  private redirectAfterLogin: string | null = null;

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => !!this.sessionSignal()?.token);
  readonly roles = computed<UserRole[]>(() => this.sessionSignal()?.user.roles ?? []);

  constructor() {
    const restored = this.restoreSession();
    if (restored) {
      this.sessionSignal.set(restored);
    }
  }

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<AuthResponse>(`${this.config.apiBaseUrl}/auth/login`, payload)
      .pipe(
        map((response) => this.toSession(response)),
        tap((session) => this.persistSession(session)),
        catchError((error) => throwError(() => error))
      );
  }

  logout(navigate = true): Observable<void> {
    const token = this.sessionSignal()?.token;
    this.clearSession();
    const request$ = token
      ? this.http.post<void>(`${this.config.apiBaseUrl}/auth/logout`, null).pipe(catchError(() => of(void 0)))
      : of(void 0);

    if (navigate) {
      request$.subscribe(() => {
        this.router.navigate(['/login']);
      });
    }

    return request$;
  }

  setRedirect(url: string): void {
    this.redirectAfterLogin = url;
  }

  consumeRedirect(): string | null {
    const target = this.redirectAfterLogin;
    this.redirectAfterLogin = null;
    return target;
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const required = Array.isArray(roles) ? roles : [roles];
    const current = this.roles();
    return required.some((role) => current.includes(role));
  }

  token(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  handleAuthFailure(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private restoreSession(): AuthSession | null {
    const stored = this.storage.read();
    if (!stored) {
      return null;
    }

    const expiresAt = stored.expiresAt ?? this.decodeExpiry(stored.token);
    if (expiresAt && expiresAt < Date.now()) {
      this.storage.clear();
      return null;
    }

    return { ...stored, expiresAt };
  }

  private persistSession(session: AuthSession): void {
    this.sessionSignal.set(session);
    this.storage.write(session);
  }

  private clearSession(): void {
    this.sessionSignal.set(null);
    this.storage.clear();
  }

  private toSession(response: AuthResponse): AuthSession {
    const expiresAt = this.decodeExpiry(response.token);
    const roles = response.roles?.length ? response.roles : ([] as UserRole[]);

    return {
      token: response.token,
      user: {
        id: response.userId,
        email: response.email,
        roles,
      },
      expiresAt,
    };
  }

  private decodeExpiry(token: string): number | undefined {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      if (payload.exp) {
        return Number(payload.exp) * 1000;
      }
    } catch (err) {
      console.warn('Failed to decode JWT expiry', err);
    }
    return undefined;
  }
}
