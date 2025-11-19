import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SiteSummary } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-script-setup',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  templateUrl: './script-setup.component.html',
  styleUrl: './script-setup.component.scss',
})
export class ScriptSetupComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toasts = inject(ToastService);

  protected sites: SiteSummary[] = [];
  protected selected?: SiteSummary;
  protected isLoading = true;
  protected error: string | null = null;

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
  }

  snippet(): string {
    const siteId = this.selected?.embedKey || this.selected?.id || 'SITE_ID';
    return `<script src="${environment.cdnBaseUrl}/autofix.js" data-site-id="${siteId}"></script>`;
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
}
