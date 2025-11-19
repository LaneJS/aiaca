import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { OnboardingStep, ScanSummary, SiteSummary } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { HttpErrorResponse } from '@angular/common/http';
import { interval, takeWhile } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toasts = inject(ToastService);
  protected sites = signal<SiteSummary[]>([]);
  protected scans = signal<ScanSummary[]>([]);
  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected runningScanIds = new Set<string>();

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
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to load scans. Please try again.');
      }
    });
  }

  runScan(siteId: string): void {
    const site = this.sites().find((s) => s.id === siteId);
    if (!site) {
      this.toasts.push('Site not found', 'error');
      return;
    }

    this.api.triggerScan(siteId, site.url).subscribe({
      next: (scan) => {
        this.toasts.push('Scan started', 'success');
        this.scans.set([scan, ...this.scans()]);
        this.runningScanIds.add(scan.id);
        this.pollScanStatus(scan.id);
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Failed to start scan';
        this.toasts.push(message, 'error');
      }
    });
  }

  private pollScanStatus(scanId: string): void {
    interval(3000)
      .pipe(takeWhile(() => this.runningScanIds.has(scanId)))
      .subscribe(() => {
        this.api.getScanStatus(scanId).subscribe({
          next: (scan) => {
            const currentScans = this.scans();
            const index = currentScans.findIndex(s => s.id === scanId);
            if (index !== -1) {
              const updatedScans = [...currentScans];
              updatedScans[index] = scan;
              this.scans.set(updatedScans);
            }

            if (scan.status === 'completed' || scan.status === 'failed') {
              this.runningScanIds.delete(scanId);
              if (scan.status === 'completed') {
                this.toasts.push('Scan completed', 'success');
              } else {
                this.toasts.push('Scan failed', 'error');
              }
            }
          },
          error: () => {
            this.runningScanIds.delete(scanId);
          }
        });
      });
  }

  getSiteName(siteId: string): string {
    return this.sites().find((s) => s.id === siteId)?.name || 'Unknown';
  }

  isScanRunning(scanId: string): boolean {
    return this.runningScanIds.has(scanId);
  }
}
