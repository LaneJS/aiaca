import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { getApiBaseUrl } from '@aiaca/config';

export interface IssueSummary {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'moderate' | 'high';
  location?: string;
  suggestion?: string;
}

export interface PublicScanResponse {
  url: string;
  score: number;
  issues: IssueSummary[];
}

@Injectable({ providedIn: 'root' })
export class ScanService {
  private readonly apiBase = getApiBaseUrl();
  private readonly http = inject(HttpClient);

  submit(url: string): Observable<PublicScanResponse> {
    const endpoint = `${this.apiBase}/public/scans`;
    return this.http.post<PublicScanResponse>(endpoint, { url }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
