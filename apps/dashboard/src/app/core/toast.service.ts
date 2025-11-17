import { Injectable, computed, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private readonly _messages = signal<ToastMessage[]>([]);
  readonly messages = computed(() => this._messages());

  push(message: string, tone: 'success' | 'error' | 'info' = 'info') {
    const next = { id: ++this.counter, message, tone };
    this._messages.update((list) => [...list, next]);
    setTimeout(() => this.dismiss(next.id), 4500);
  }

  dismiss(id: number) {
    this._messages.update((list) => list.filter((msg) => msg.id !== id));
  }
}
