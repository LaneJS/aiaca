import { Injectable, Signal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { UserProfile } from './models';

const TOKEN_KEY = 'aaca_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<UserProfile | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => !!this._user());

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this._user.set({ id: 'demo', name: 'Demo User', email: 'demo@aaca.dev' });
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ userId: string; email: string; token: string }>('/api/v1/auth/login', { email, password }).pipe(
      tap((res) => {
        this.persistSession(res.token, { id: res.userId, email: res.email, name: res.email.split('@')[0] });
      })
    );
  }

  signup(name: string, email: string, password: string) {
    return this.http
      .post<{ userId: string; email: string; token: string }>('/api/v1/auth/register', {
        name,
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.persistSession(res.token, { id: res.userId, email: res.email, name: res.email.split('@')[0] });
        })
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/auth']);
  }

  ensureDemoSession() {
    if (!this._user()) {
      this.persistSession('demo-token', { id: 'demo', name: 'Demo User', email: 'demo@aaca.dev' });
    }
  }

  private persistSession(token: string, user: UserProfile) {
    localStorage.setItem(TOKEN_KEY, token);
    this._user.set(user);
  }
}
