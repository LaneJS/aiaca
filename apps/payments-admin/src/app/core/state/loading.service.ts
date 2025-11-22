import { Injectable, computed, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly active = signal(0);

  readonly isLoading = computed(() => this.active() > 0);

  track<T>(source: Observable<T>): Observable<T> {
    this.active.update((value) => value + 1);
    return source.pipe(finalize(() => this.active.update((value) => Math.max(0, value - 1))));
  }
}
