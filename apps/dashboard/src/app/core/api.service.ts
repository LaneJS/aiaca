import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { IssueDetail, ScanDetail, ScanSummary, SiteSummary } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listSites() {
    return this.http.get<SiteSummary[]>('/api/v1/sites').pipe(catchError(() => of(this.mockSites())));
  }

  getSite(id: string) {
    return this.http.get<SiteSummary>(`/api/v1/sites/${id}`).pipe(
      catchError(() => of(this.mockSites().find((s) => s.id === id) as SiteSummary))
    );
  }

  createSite(name: string, url: string) {
    return this.http.post<SiteSummary>('/api/v1/sites', { name, url });
  }

  listScans(siteId?: string) {
    const endpoint = siteId ? `/api/v1/sites/${siteId}/scans` : '/api/v1/scans';
    return this.http.get<ScanSummary[]>(endpoint).pipe(catchError(() => of(this.mockScans(siteId))));
  }

  getScan(id: string) {
    return this.http.get<ScanDetail>(`/api/v1/scans/${id}`).pipe(catchError(() => of(this.mockScanDetail(id))));
  }

  triggerScan(siteId: string, pageUrl: string) {
    return this.http.post<ScanSummary>(`/api/v1/sites/${siteId}/scans`, { pageUrl }).pipe(
      catchError(() => of(this.mockScans(siteId)[0]))
    );
  }

  private mockSites(): SiteSummary[] {
    return [
      {
        id: 'site-1',
        name: 'Sunrise Coffee',
        url: 'https://sunrise.example.com',
        lastScan: '2025-02-10T12:00:00Z',
        score: 86,
        issuesOpen: 8,
        status: 'attention',
        embedKey: 'embed-123',
      },
      {
        id: 'site-2',
        name: 'Northwind Bikes',
        url: 'https://bikes.example.com',
        lastScan: '2025-02-08T12:00:00Z',
        score: 92,
        issuesOpen: 3,
        status: 'healthy',
        embedKey: 'embed-456',
      },
    ];
  }

  private mockScans(siteId?: string): ScanSummary[] {
    const scans: ScanSummary[] = [
      {
        id: 'scan-1',
        siteId: 'site-1',
        createdAt: '2025-02-10T12:00:00Z',
        score: 86,
        status: 'completed',
        issueCount: 8,
      },
      {
        id: 'scan-2',
        siteId: 'site-2',
        createdAt: '2025-02-08T12:00:00Z',
        score: 92,
        status: 'completed',
        issueCount: 3,
      },
    ];
    return siteId ? scans.filter((s) => s.siteId === siteId) : scans;
  }

  private mockScanDetail(id: string): ScanDetail {
    const base: ScanSummary = this.mockScans().find((s) => s.id === id) ?? {
      id,
      siteId: 'site-1',
      createdAt: new Date().toISOString(),
      score: 80,
      status: 'completed',
      issueCount: 5,
    };
    const issues: IssueDetail[] = [
      {
        id: 'iss-1',
        title: 'Images missing alt text',
        severity: 'high',
        description: '2 product thumbnails are missing alt text.',
        suggestion: 'Provide short descriptions for the product thumbnails.',
        selector: 'img.product-thumb',
        status: 'open',
        category: 'media',
      },
      {
        id: 'iss-2',
        title: 'Insufficient color contrast',
        severity: 'medium',
        description: 'Button text on hero has low contrast against background.',
        suggestion: 'Use #0f172a text on #fbbf24 background or darken background.',
        selector: '.hero-cta',
        status: 'open',
        category: 'contrast',
      },
      {
        id: 'iss-3',
        title: 'Form inputs missing labels',
        severity: 'high',
        description: 'Newsletter form email input lacks an accessible label.',
        suggestion: 'Associate the input with a <label> element using for/id.',
        selector: '#newsletter-email',
        status: 'fixed',
        category: 'forms',
      },
    ];
    return { ...base, aiSummary: 'AI suggests prioritizing media alt text fixes first.', issues };
  }
}
