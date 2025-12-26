import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ScanSummary, SiteSummary } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ScanTrackerService } from '../../core/scan-tracker.service';
import { ToastService } from '../../core/toast.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionStateService } from '../../core/subscription-state.service';

@Component({
  selector: 'app-scans',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './scans.component.html',
  styleUrl: './scans.component.scss',
})
export class ScansComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly tracker = inject(ScanTrackerService);
  private readonly toast = inject(ToastService);
  private readonly subscriptions = inject(SubscriptionStateService);

  protected scans: ScanSummary[] = [];
  protected sites: SiteSummary[] = [];
  protected isLoading = true;
  protected error: string | null = null;
  protected runningScanIds = new Set<string>();
  protected selectedSiteId = '';
  protected showSubscriptionModal = false;
  protected subscriptionMessage = 'An active subscription is required to run scans.';

  ngOnInit(): void {
    this.subscriptions.refresh().subscribe();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.api.listSites().subscribe({
      next: (sites) => {
        this.sites = sites;
        this.loadScans();
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load sites. Please try again.';
      }
    });
  }

  private loadScans(): void {
    this.api.listScans().subscribe({
      next: (scans) => {
        this.scans = scans;
        this.isLoading = false;
        this.watchInProgress(scans);
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load scans. Please try again.';
      }
    });
  }

  runScan(): void {
    if (this.isReadOnly) {
      this.openSubscriptionModal('run scans');
      return;
    }
    const site = this.sites.find((s) => s.id === this.selectedSiteId);
    if (!site) {
      this.toast.push('Select a site to run a scan', 'error');
      return;
    }

    this.tracker.triggerAndWatch(site.id, site.url).subscribe({
      next: (scan) => {
        this.upsertScan(scan);
        if (scan.status === 'completed') {
          this.runningScanIds.delete(scan.id);
          this.toast.push('Scan completed', 'success');
        } else if (scan.status === 'failed') {
          this.runningScanIds.delete(scan.id);
          this.toast.push('Scan failed', 'error');
        } else {
          this.runningScanIds.add(scan.id);
        }
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Failed to start scan';
        this.toast.push(message, 'error');
      }
    });
  }

  view(scan: ScanSummary): void {
    this.router.navigate(['/scans', scan.id]);
  }

  siteName(scan: ScanSummary): string {
    return this.sites.find((s) => s.id === scan.siteId)?.name || 'Unknown';
  }

  retryLoad(): void {
    this.loadData();
  }

  isScanRunning(scanId: string): boolean {
    return this.runningScanIds.has(scanId);
  }

  private watchInProgress(scans: ScanSummary[]): void {
    scans.filter((s) => s.status === 'queued' || s.status === 'running').forEach((scan) => {
      this.runningScanIds.add(scan.id);
      this.tracker.watchScan(scan.id).subscribe({
        next: (updated) => {
          this.upsertScan(updated);
          if (updated.status === 'completed') {
            this.toast.push('Scan completed', 'success');
            this.runningScanIds.delete(updated.id);
          } else if (updated.status === 'failed') {
            this.toast.push('Scan failed', 'error');
            this.runningScanIds.delete(updated.id);
          }
        },
        error: () => this.runningScanIds.delete(scan.id)
      });
    });
  }

  private upsertScan(scan: ScanSummary): void {
    const idx = this.scans.findIndex((s) => s.id === scan.id);
    if (idx >= 0) {
      const next = [...this.scans];
      next[idx] = scan;
      this.scans = next;
    } else {
      this.scans = [scan, ...this.scans];
    }
  }

  openSubscriptionModal(action: string): void {
    this.subscriptionMessage = `An active subscription is required to ${action}.`;
    this.showSubscriptionModal = true;
  }

  closeSubscriptionModal(): void {
    this.showSubscriptionModal = false;
  }

  goToBilling(): void {
    this.showSubscriptionModal = false;
    this.router.navigate(['/account'], { queryParams: { billing: 'required' } });
  }

  get isReadOnly(): boolean {
    return this.subscriptions.isReadOnly();
  }
}
