import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { OnboardingStep, ScanSummary, SiteSummary } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ScanTrackerService } from '../../core/scan-tracker.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toasts = inject(ToastService);
  private readonly scanTracker = inject(ScanTrackerService);
  protected sites = signal<SiteSummary[]>([]);
  protected scans = signal<ScanSummary[]>([]);
  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected runningScanIds = new Set<string>();
  protected selectedSiteId = signal<string>('');

  protected onboarding = computed<OnboardingStep[]>(() => {
    const hasSite = this.sites().length > 0;
    const hasScan = this.scans().length > 0;
    const hasEmbed = this.sites().some((s) => s.embedKey);
    return [
      {
        id: 'site',
        label: 'Add your first site',
        description: 'Tell us which domain to watch for accessibility issues.',
        completed: hasSite,
      },
      {
        id: 'scan',
        label: 'Run a baseline scan',
        description: 'Run at least one scan to capture your current score.',
        completed: hasScan,
      },
      {
        id: 'script',
        label: 'Install the embed script',
        description: 'Drop in the script snippet to receive auto-fix patches.',
        completed: hasEmbed,
      },
    ];
  });

  protected averageScore = computed(() => {
    const list = this.scans();
    if (!list.length) return 0;
    const total = list.reduce((t, s) => t + s.score, 0);
    return Math.round(total / list.length);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.listSites().subscribe({
      next: (sites) => {
        this.sites.set(sites);
        this.loadScans();
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to load sites. Please try again.');
      }
    });
  }

  private loadScans(): void {
    this.api.listScans().subscribe({
      next: (scans) => {
        this.scans.set(scans);
        this.isLoading.set(false);
        this.watchInProgress(scans);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to load scans. Please try again.');
      }
    });
  }

  runScan(): void {
    const siteId = this.selectedSiteId();
    const site = this.sites().find((s) => s.id === siteId);
    if (!site) {
      this.toasts.push('Site not found', 'error');
      return;
    }

    this.scanTracker.triggerAndWatch(siteId, site.url).subscribe({
      next: (scan) => {
        this.upsertScan(scan);
        if (scan.status === 'completed') {
          this.runningScanIds.delete(scan.id);
          this.toasts.push('Scan completed', 'success');
        } else if (scan.status === 'failed') {
          this.runningScanIds.delete(scan.id);
          this.toasts.push('Scan failed', 'error');
        } else {
          this.runningScanIds.add(scan.id);
        }
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Failed to start scan';
        this.toasts.push(message, 'error');
      }
    });
  }

  getSiteName(siteId: string): string {
    return this.sites().find((s) => s.id === siteId)?.name || 'Unknown';
  }

  isScanRunning(scanId: string): boolean {
    return this.runningScanIds.has(scanId);
  }

  private watchInProgress(scans: ScanSummary[]): void {
    scans.filter((s) => s.status === 'queued' || s.status === 'running').forEach((scan) => {
      this.runningScanIds.add(scan.id);
      this.scanTracker.watchScan(scan.id).subscribe({
        next: (updated) => {
          this.upsertScan(updated);
          if (updated.status === 'completed') {
            this.toasts.push('Scan completed', 'success');
            this.runningScanIds.delete(updated.id);
          } else if (updated.status === 'failed') {
            this.toasts.push('Scan failed', 'error');
            this.runningScanIds.delete(updated.id);
          }
        },
        error: () => {
          this.runningScanIds.delete(scan.id);
        }
      });
    });
  }

  private upsertScan(scan: ScanSummary): void {
    const list = this.scans();
    const idx = list.findIndex((s) => s.id === scan.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = scan;
      this.scans.set(next);
    } else {
      this.scans.set([scan, ...list]);
    }
  }
}
