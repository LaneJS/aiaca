import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserProfile } from './models';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'aaca_token';
const USER_KEY = 'aaca_user';
type LogoutReason = 'manual' | 'expired' | 'unauthorized';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  private readonly storage: Storage = this.resolveStorage();
  private tokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _logoutReason = signal<LogoutReason | null>(null);

  private readonly _user = signal<UserProfile | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => !!this._user() && !this.isTokenExpired());

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<{ userId: string; email: string; name?: string; token: string }> {
    return this.http.post<{ userId: string; email: string; name?: string; token: string }>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        this.persistSession(res.token, this.toUserProfile(res.token, res.userId, res.email, res.name));
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<{ userId: string; email: string; name?: string; token: string }> {
    return this.http
      .post<{ userId: string; email: string; name?: string; token: string }>(`${this.baseUrl}/auth/register`, {
        name,
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.persistSession(res.token, this.toUserProfile(res.token, res.userId, res.email, res.name || name));
        })
      );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/password-reset/request`, { email });
  }

  confirmPasswordReset(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/password-reset/confirm`, { token, password });
  }

  logout(reason: LogoutReason = 'manual'): void {
    const token = this.storage.getItem(TOKEN_KEY);

    // Clear session immediately (don't wait for API call)
    this.clearSession(reason);

    // Call backend to blacklist token (fire and forget)
    // Note: We manually attach the Authorization header since we've already cleared the session
    if (token && reason !== 'expired') {
      this.http
        .post(`${this.baseUrl}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          error: () => {
            // Ignore errors - user is already logged out locally
          },
        });
    }

    this.router.navigate(['/auth'], { queryParams: { reason } });
  }

  consumeLogoutReason(): LogoutReason | null {
    const reason = this._logoutReason();
    this._logoutReason.set(null);
    return reason;
  }

  sessionStatus(): 'valid' | 'expired' | 'none' {
    const token = this.storage.getItem(TOKEN_KEY);
    if (!token) return 'none';
    if (this.isExpired(token)) {
      this.clearSession('expired');
      return 'expired';
    }
    return this._user() ? 'valid' : 'none';
  }

  getToken(): string | null {
    const token = this.storage.getItem(TOKEN_KEY);
    if (token && this.isExpired(token)) {
      this.clearSession('expired');
      return null;
    }
    return token;
  }

  private restoreSession(): void {
    const token = this.storage.getItem(TOKEN_KEY);
    const userJson = this.storage.getItem(USER_KEY);

    if (!token) {
      return;
    }

    if (this.isExpired(token)) {
      this.clearSession('expired');
      return;
    }

    let user: UserProfile | null = null;

    if (userJson) {
      try {
        user = JSON.parse(userJson) as UserProfile;
      } catch {
        this.clearSession('unauthorized');
        return;
      }
    }

    const resolvedUser = user ?? this.toUserProfile(token);
    this._user.set(resolvedUser);
    this.scheduleExpiry(token);

    if (!userJson) {
      this.storage.setItem(USER_KEY, JSON.stringify(resolvedUser));
    }
  }

  private persistSession(token: string, user: UserProfile): void {
    this.storage.setItem(TOKEN_KEY, token);
    this.storage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._logoutReason.set(null);
    this.scheduleExpiry(token);
  }

  private clearSession(reason: LogoutReason = 'manual'): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    this.storage.removeItem(TOKEN_KEY);
    this.storage.removeItem(USER_KEY);
    this._user.set(null);
    this._logoutReason.set(reason);
  }

  private resolveStorage(): Storage {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }

    console.warn('[AuthService] Session storage is unavailable; using in-memory session store.');
    return new MemoryStorage();
  }

  private toUserProfile(token: string, userId?: string, email?: string, name?: string): UserProfile {
    const decoded = this.decode(token);
    const derivedEmail = email || decoded.email || '';
    const derivedId = userId || decoded.sub || '';
    const derivedName = name || (derivedEmail ? derivedEmail.split('@')[0] : 'User');
    return {
      id: derivedId,
      email: derivedEmail,
      name: derivedName
    };
  }

  private decode(token: string): { exp?: number; email?: string; sub?: string } {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      if (typeof atob === 'undefined') {
        return {};
      }
      const decoded = atob(normalized);
      const parsed = JSON.parse(decoded);
      return {
        exp: parsed.exp,
        email: parsed.email,
        sub: parsed.sub
      };
    } catch {
      return {};
    }
  }

  private isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded.exp) return false;
    const expiryMs = decoded.exp * 1000;
    return Date.now() >= expiryMs;
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    return token ? this.isExpired(token) : true;
  }

  private scheduleExpiry(token: string): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    const decoded = this.decode(token);
    if (!decoded.exp) return;

    const expiryMs = decoded.exp * 1000;
    const timeout = Math.max(expiryMs - Date.now(), 0);
    this.tokenExpiryTimer = setTimeout(() => {
      this.logout('expired');
    }, timeout);
  }
}
