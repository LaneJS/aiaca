import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserProfile } from './models';

const TOKEN_KEY = 'aaca_token';
const USER_KEY = 'aaca_user';

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

  private readonly storage: Storage = this.resolveStorage();

  private readonly _user = signal<UserProfile | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => !!this._user());

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<{ userId: string; email: string; name?: string; token: string }> {
    return this.http.post<{ userId: string; email: string; name?: string; token: string }>('/api/v1/auth/login', { email, password }).pipe(
      tap((res) => {
        this.persistSession(res.token, {
          id: res.userId,
          email: res.email,
          name: res.name || res.email.split('@')[0]
        });
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<{ userId: string; email: string; name?: string; token: string }> {
    return this.http
      .post<{ userId: string; email: string; name?: string; token: string }>('/api/v1/auth/register', {
        name,
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.persistSession(res.token, {
            id: res.userId,
            email: res.email,
            name: res.name || name
          });
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  private restoreSession(): void {
    const token = this.storage.getItem(TOKEN_KEY);
    const userJson = this.storage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserProfile;
        this._user.set(user);
      } catch {
        this.clearSession();
      }
    }
  }

  private persistSession(token: string, user: UserProfile): void {
    this.storage.setItem(TOKEN_KEY, token);
    this.storage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private clearSession(): void {
    this.storage.removeItem(TOKEN_KEY);
    this.storage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private resolveStorage(): Storage {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }

    console.warn('[AuthService] Session storage is unavailable; using in-memory session store.');
    return new MemoryStorage();
  }
}
