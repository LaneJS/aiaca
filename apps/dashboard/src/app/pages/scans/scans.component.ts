import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ScanSummary, SiteSummary } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-scans',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './scans.component.html',
  styleUrl: './scans.component.scss',
})
export class ScansComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected scans: ScanSummary[] = [];
  protected sites: SiteSummary[] = [];
  protected isLoading = true;
  protected error: string | null = null;

  ngOnInit(): void {
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
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load scans. Please try again.';
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
}
