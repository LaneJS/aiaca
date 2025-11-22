import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { AuthSession } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthTokenStorage {
  private memorySession: AuthSession | null = null;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  read(): AuthSession | null {
    if (this.memorySession) {
      return this.memorySession;
    }

    try {
      const raw = sessionStorage.getItem(this.config.authStorageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as AuthSession;
      this.memorySession = parsed;
      return parsed;
    } catch (err) {
      console.warn('Failed to read auth session from storage', err);
      return null;
    }
  }

  write(session: AuthSession): void {
    this.memorySession = session;
    try {
      sessionStorage.setItem(this.config.authStorageKey, JSON.stringify(session));
    } catch (err) {
      console.warn('Failed to persist auth session', err);
    }
  }

  clear(): void {
    this.memorySession = null;
    try {
      sessionStorage.removeItem(this.config.authStorageKey);
    } catch (err) {
      console.warn('Failed to clear auth session', err);
    }
  }
}
