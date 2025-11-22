import { Injectable, computed, signal } from '@angular/core';

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  level: ToastLevel;
  message: string;
  title?: string;
  createdAt: number;
  autoCloseMs?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = signal<ToastMessage[]>([]);

  readonly toasts = computed(() => this.messages());

  info(message: string, title?: string, autoCloseMs = 4000): void {
    this.push({ level: 'info', message, title, autoCloseMs });
  }

  success(message: string, title?: string, autoCloseMs = 3500): void {
    this.push({ level: 'success', message, title, autoCloseMs });
  }

  warning(message: string, title?: string, autoCloseMs = 5000): void {
    this.push({ level: 'warning', message, title, autoCloseMs });
  }

  error(message: string, title?: string, autoCloseMs = 6000): void {
    this.push({ level: 'error', message, title, autoCloseMs });
  }

  dismiss(id: string): void {
    this.messages.update((items) => items.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.messages.set([]);
  }

  private push(input: Omit<ToastMessage, 'id' | 'createdAt'>): void {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const toast: ToastMessage = {
      ...input,
      id,
      createdAt: Date.now(),
    };

    this.messages.update((items) => [...items, toast]);

    if (input.autoCloseMs && input.autoCloseMs > 0) {
      window.setTimeout(() => this.dismiss(toast.id), input.autoCloseMs);
    }
  }
}
