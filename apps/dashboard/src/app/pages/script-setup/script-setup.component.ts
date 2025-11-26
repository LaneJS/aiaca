import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SiteSummary, EmbedConfig } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-script-setup',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './script-setup.component.html',
  styleUrl: './script-setup.component.scss',
})
export class ScriptSetupComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly toasts = inject(ToastService);

  protected sites: SiteSummary[] = [];
  protected selected?: SiteSummary;
  protected isLoading = true;
  protected error: string | null = null;
  protected verifyStatus: 'idle' | 'checking' | 'success' | 'error' = 'idle';
  protected verifyMessage = '';
  protected embedConfig?: EmbedConfig;
  protected cdnBase = environment.cdnBaseUrl.replace(/\/$/, '');

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.isLoading = true;
    this.error = null;

    this.api.listSites().subscribe({
      next: (sites) => {
        this.sites = sites;
        this.isLoading = false;
        if (sites.length > 0 && !this.selected) {
          this.selected = sites[0];
          this.fetchEmbedConfig();
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load sites. Please try again.';
      }
    });
  }

  select(siteId: string): void {
    this.selected = this.sites.find((s) => s.id === siteId);
    this.verifyStatus = 'idle';
    this.verifyMessage = '';
    this.embedConfig = undefined;
    this.fetchEmbedConfig();
  }

  snippet(): string {
    const siteId = this.selected?.embedKey || this.selected?.id || 'SITE_ID';
    return `<script src="${this.cdnBase}/autofix.js" data-site-id="${siteId}"></script>`;
  }

  copy(textarea: HTMLTextAreaElement): void {
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(
      () => {
        this.toasts.push('Script copied to clipboard', 'success');
      },
      () => {
        this.toasts.push('Failed to copy to clipboard', 'error');
      }
    );
  }

  verifyInstall(): void {
    if (!this.selected) return;
    this.verifyStatus = 'checking';
    this.verifyMessage = 'Pinging embed configuration...';

    this.api.getEmbedConfig(this.selected.id).subscribe({
      next: (config) => {
        this.embedConfig = config;
        this.verifyStatus = 'success';
        this.verifyMessage = 'Embed endpoint responded. Script should load if included on your site.';
      },
      error: (err: HttpErrorResponse) => {
        this.verifyStatus = 'error';
        this.verifyMessage = this.parseVerifyError(err);
      }
    });
  }

  private fetchEmbedConfig(): void {
    if (!this.selected) return;
    this.api.getEmbedConfig(this.selected.id).subscribe({
      next: (config) => (this.embedConfig = config),
      error: () => {
        this.embedConfig = undefined;
      }
    });
  }

  private parseVerifyError(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Network error checking embed. Verify connectivity and try again.';
    if (error.status === 404) return 'Embed config not found. Ensure the site exists and has a valid embed key.';
    if (error.status === 401 || error.status === 403) return 'Not authorized to fetch embed config. Please re-authenticate.';
    return error.error?.message || 'Embed endpoint is unreachable right now.';
  }
}
