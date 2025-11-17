import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
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
    return this.http
      .post<PublicScanResponse>(endpoint, { url })
      .pipe(catchError(() => of(this.mockResponse(url))));
  }

  private mockResponse(url: string): PublicScanResponse {
    return {
      url,
      score: 82,
      issues: [
        {
          id: 'mock-1',
          type: 'alt_text',
          severity: 'moderate',
          description: 'Image elements on the hero lack descriptive alt text.',
          location: 'Hero banner image',
          suggestion: 'Add concise alt text that describes the image intent.',
        },
        {
          id: 'mock-2',
          type: 'contrast',
          severity: 'high',
          description: 'Button text does not meet contrast ratios against the background.',
          location: 'Primary CTA',
          suggestion: 'Use a darker background (#0f172a) with white text for 7:1 contrast.',
        },
      ],
    };
  }
}
