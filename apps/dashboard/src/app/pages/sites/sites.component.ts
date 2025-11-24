import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SiteSummary } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss',
})
export class SitesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected sites: SiteSummary[] = [];
  protected showAddModal = false;
  protected showEditModal = false;
  protected showDeleteModal = false;
  protected newSiteName = '';
  protected newSiteUrl = '';
  protected isSubmitting = false;
  protected busyAction: 'create' | 'update' | 'delete' | null = null;
  protected shouldTriggerScan = true;
  protected isLoading = true;
  protected error: string | null = null;
  protected editingSite: SiteSummary | null = null;
  protected deletingSite: SiteSummary | null = null;

  ngOnInit(): void {
    this.loadSites();
  }

  private loadSites(): void {
    this.isLoading = true;
    this.error = null;

    this.api.listSites().subscribe({
      next: (sites) => {
        this.sites = sites;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load sites. Please try again.';
      }
    });
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

  openEditModal(site: SiteSummary): void {
    this.editingSite = site;
    this.newSiteName = site.name;
    this.newSiteUrl = site.url;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSite = null;
    this.newSiteName = '';
    this.newSiteUrl = '';
  }

  openDeleteModal(site: SiteSummary): void {
    this.deletingSite = site;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingSite = null;
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
    this.busyAction = 'create';
    this.api.createSite(this.newSiteName.trim(), this.newSiteUrl.trim()).subscribe({
      next: (site) => {
        this.toast.push('Site added successfully', 'success');
        this.closeAddModal();
        this.loadSites();

        if (this.shouldTriggerScan) {
          this.triggerInitialScan(site.id, site.url);
        }
        this.isSubmitting = false;
        this.busyAction = null;
      },
      error: (err: HttpErrorResponse) => {
        const message = this.formatError(err, 'Failed to add site');
        this.toast.push(message, 'error');
        this.isSubmitting = false;
        this.busyAction = null;
      }
    });
  }

  submitEditSite(): void {
    if (!this.isFormValid() || !this.editingSite || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.busyAction = 'update';
    const updates = {
      name: this.newSiteName.trim(),
      url: this.newSiteUrl.trim()
    };

    this.api.updateSite(this.editingSite.id, updates).subscribe({
      next: () => {
        this.toast.push('Site updated successfully', 'success');
        this.closeEditModal();
        this.loadSites();
        this.isSubmitting = false;
        this.busyAction = null;
      },
      error: (err: HttpErrorResponse) => {
        const message = this.formatError(err, 'Failed to update site');
        this.toast.push(message, 'error');
        this.isSubmitting = false;
        this.busyAction = null;
      }
    });
  }

  confirmDelete(): void {
    if (!this.deletingSite || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.busyAction = 'delete';
    this.api.deleteSite(this.deletingSite.id).subscribe({
      next: () => {
        this.toast.push('Site deleted successfully', 'success');
        this.closeDeleteModal();
        this.loadSites();
        this.isSubmitting = false;
        this.busyAction = null;
      },
      error: (err: HttpErrorResponse) => {
        const message = this.formatError(err, 'Failed to delete site');
        this.toast.push(message, 'error');
        this.isSubmitting = false;
        this.busyAction = null;
        this.closeDeleteModal();
      }
    });
  }

  private triggerInitialScan(siteId: string, pageUrl: string): void {
    this.api.triggerScan(siteId, pageUrl).subscribe({
      next: () => {
        this.toast.push('Initial scan started', 'info');
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Failed to start scan';
        this.toast.push(message, 'error');
      }
    });
  }

  private formatError(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'Network error. Check your connection and try again.';
    }
    if (err.status === 409) {
      return err.error?.message || 'A site with this domain already exists.';
    }
    if (err.status === 400 && err.error?.message) {
      return err.error.message;
    }
    return err.error?.message || fallback;
  }

  view(site: SiteSummary): void {
    this.router.navigate(['./', site.id], { relativeTo: this.route });
  }

  retryLoad(): void {
    this.loadSites();
  }
}
