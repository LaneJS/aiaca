import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueDetail, ScanDetail, ScanSummary, SiteSummary } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listSites(): Observable<SiteSummary[]> {
    return this.http.get<SiteSummary[]>('/api/v1/sites');
  }

  getSite(id: string): Observable<SiteSummary> {
    return this.http.get<SiteSummary>(`/api/v1/sites/${id}`);
  }

  createSite(name: string, url: string): Observable<SiteSummary> {
    return this.http.post<SiteSummary>('/api/v1/sites', { name, url });
  }

  updateSite(siteId: string, updates: Partial<SiteSummary>): Observable<SiteSummary> {
    return this.http.patch<SiteSummary>(`/api/v1/sites/${siteId}`, updates);
  }

  deleteSite(siteId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/sites/${siteId}`);
  }

  listScans(siteId?: string): Observable<ScanSummary[]> {
    const endpoint = siteId ? `/api/v1/sites/${siteId}/scans` : '/api/v1/scans';
    return this.http.get<ScanSummary[]>(endpoint);
  }

  getScan(id: string): Observable<ScanDetail> {
    return this.http.get<ScanDetail>(`/api/v1/scans/${id}`);
  }

  getScanStatus(scanId: string): Observable<ScanSummary> {
    return this.http.get<ScanSummary>(`/api/v1/scans/${scanId}`);
  }

  triggerScan(siteId: string, pageUrl: string): Observable<ScanSummary> {
    return this.http.post<ScanSummary>(`/api/v1/sites/${siteId}/scans`, { pageUrl });
  }

  updateIssueStatus(scanId: string, issueId: string, status: 'open' | 'fixed'): Observable<IssueDetail> {
    return this.http.patch<IssueDetail>(`/api/v1/scans/${scanId}/issues/${issueId}`, { status });
  }
}
