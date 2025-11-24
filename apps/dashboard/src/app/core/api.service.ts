import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmbedConfig, IssueDetail, NotificationSettings, Plan, Price, ScanDetail, ScanSummary, ScanShareLink, SiteSchedule, SiteSummary, Subscription } from './models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  listSites(): Observable<SiteSummary[]> {
    return this.http.get<SiteSummary[]>(`${this.baseUrl}/sites`);
  }

  getSite(id: string): Observable<SiteSummary> {
    return this.http.get<SiteSummary>(`${this.baseUrl}/sites/${id}`);
  }

  createSite(name: string, url: string): Observable<SiteSummary> {
    return this.http.post<SiteSummary>(`${this.baseUrl}/sites`, { name, url });
  }

  updateSite(siteId: string, updates: Partial<SiteSummary>): Observable<SiteSummary> {
    return this.http.patch<SiteSummary>(`${this.baseUrl}/sites/${siteId}`, updates);
  }

  deleteSite(siteId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sites/${siteId}`);
  }

  listScans(siteId?: string): Observable<ScanSummary[]> {
    const endpoint = siteId ? `${this.baseUrl}/sites/${siteId}/scans` : `${this.baseUrl}/scans`;
    return this.http.get<ScanSummary[]>(endpoint);
  }

  getScan(id: string): Observable<ScanDetail> {
    return this.http.get<ScanDetail>(`${this.baseUrl}/scans/${id}`);
  }

  getScanStatus(scanId: string): Observable<ScanSummary> {
    return this.http.get<ScanSummary>(`${this.baseUrl}/scans/${scanId}`);
  }

  triggerScan(siteId: string, pageUrl: string): Observable<ScanSummary> {
    return this.http.post<ScanSummary>(`${this.baseUrl}/sites/${siteId}/scans`, { pageUrl });
  }

  updateIssueStatus(scanId: string, issueId: string, status: 'open' | 'fixed'): Observable<IssueDetail> {
    return this.http.patch<IssueDetail>(`${this.baseUrl}/scans/${scanId}/issues/${issueId}`, { status });
  }

  getEmbedConfig(siteId: string): Observable<EmbedConfig> {
    return this.http.get<EmbedConfig>(`${this.baseUrl}/sites/${siteId}/embed-config`);
  }

  getSiteSchedule(siteId: string): Observable<SiteSchedule> {
    return this.http.get<SiteSchedule>(`${this.baseUrl}/sites/${siteId}/schedule`);
  }

  updateSiteSchedule(siteId: string, schedule: SiteSchedule): Observable<SiteSchedule> {
    return this.http.put<SiteSchedule>(`${this.baseUrl}/sites/${siteId}/schedule`, schedule);
  }

  exportScan(scanId: string, format: 'pdf' | 'html'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/scans/${scanId}/export`, {
      params: { format },
      responseType: 'blob',
    });
  }

  createShareLink(scanId: string): Observable<ScanShareLink> {
    return this.http.post<ScanShareLink>(`${this.baseUrl}/scans/${scanId}/share`, {});
  }

  getSiteNotifications(siteId: string): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.baseUrl}/sites/${siteId}/notifications`);
  }

  updateSiteNotifications(siteId: string, settings: NotificationSettings): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(`${this.baseUrl}/sites/${siteId}/notifications`, settings);
  }

  listPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl.replace('/api/v1', '/api/v1/billing')}/plans`);
  }

  listPrices(planId: string): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.baseUrl.replace('/api/v1', '/api/v1/billing')}/plans/${planId}/prices`);
  }

  listSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl.replace('/api/v1', '/api/v1/billing')}/subscriptions`).pipe(
      // API returns PageResponse; extract content if present
      map((res: any) => (Array.isArray(res) ? res : res?.items ?? []))
    );
  }
}
