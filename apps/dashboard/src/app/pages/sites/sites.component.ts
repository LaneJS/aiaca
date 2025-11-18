import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SiteSummary } from '../../core/models';

@Component({
  selector: 'app-sites',
  standalone: false,
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss',
})
export class SitesComponent implements OnInit {
  protected sites: SiteSummary[] = [];
  protected showAddModal = false;
  protected newSiteName = '';
  protected newSiteUrl = '';
  protected isSubmitting = false;
  protected shouldTriggerScan = true;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSites();
  }

  private loadSites(): void {
    this.api.listSites().subscribe((sites) => (this.sites = sites));
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newSiteName = '';
    this.newSiteUrl = '';
    this.shouldTriggerScan = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newSiteName = '';
    this.newSiteUrl = '';
  }

  isFormValid(): boolean {
    return this.newSiteName.trim().length > 0 && this.isValidUrl(this.newSiteUrl);
  }

  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  submitAddSite(): void {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.api.createSite(this.newSiteName.trim(), this.newSiteUrl.trim()).subscribe({
      next: (site) => {
        this.toast.push('Site added successfully', 'success');
        this.closeAddModal();
        this.loadSites();

        if (this.shouldTriggerScan) {
          this.triggerInitialScan(site.id);
        }
      },
      error: (err) => {
        this.toast.push('Failed to add site: ' + (err.error?.message || err.message || 'Unknown error'), 'error');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private triggerInitialScan(siteId: string): void {
    this.api.triggerScan(siteId).subscribe({
      next: () => {
        this.toast.push('Initial scan started', 'info');
      },
      error: (err) => {
        this.toast.push('Failed to start scan: ' + (err.error?.message || 'Unknown error'), 'error');
      }
    });
  }

  view(site: SiteSummary) {
    this.router.navigate(['./', site.id], { relativeTo: this.route });
  }
}
