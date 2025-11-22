import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { MutationOptions } from './types';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  get<T>(path: string, params?: Record<string, unknown>) {
    return this.http.get<T>(this.buildUrl(path), { params: this.toParams(params) });
  }

  post<T>(path: string, body: unknown, options?: MutationOptions) {
    return this.http.post<T>(this.buildUrl(path), body, {
      params: this.toParams(options?.params),
      headers: this.withIdempotency(options?.headers, options?.idempotencyKey),
    });
  }

  patch<T>(path: string, body: unknown, options?: MutationOptions) {
    return this.http.patch<T>(this.buildUrl(path), body, {
      params: this.toParams(options?.params),
      headers: this.withIdempotency(options?.headers, options?.idempotencyKey),
    });
  }

  delete<T>(path: string, options?: MutationOptions) {
    return this.http.delete<T>(this.buildUrl(path), {
      params: this.toParams(options?.params),
      headers: this.withIdempotency(options?.headers, options?.idempotencyKey),
    });
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    if (path.startsWith(this.config.apiBaseUrl)) {
      return path;
    }

    const base = this.config.apiBaseUrl.endsWith('/')
      ? this.config.apiBaseUrl.slice(0, -1)
      : this.config.apiBaseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private toParams(params?: Record<string, unknown>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  private withIdempotency(headers?: Record<string, string>, idempotencyKey?: string) {
    const nextHeaders = { ...(headers ?? {}) };
    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

    nextHeaders['Idempotency-Key'] = key;
    return nextHeaders;
  }
}
