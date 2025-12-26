import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { IssueDetail, ScanDetail } from '../../core/models';
import { issueTypeCopy, severityCopy } from './copy';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SubscriptionStateService } from '../../core/subscription-state.service';

@Component({
  selector: 'app-scan-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './scan-detail.component.html',
  styleUrl: './scan-detail.component.scss',
})
export class ScanDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toasts = inject(ToastService);
  private readonly subscriptions = inject(SubscriptionStateService);

  protected scan?: ScanDetail;
  protected filter = signal<'all' | 'open' | 'fixed'>('all');
  protected severityFilter = signal<string>('all');
  protected typeFilter = signal<string>('all');
  protected readonly severityCopy = severityCopy;
  protected readonly severityOrder: Array<keyof typeof severityCopy> = ['high', 'medium', 'low'];
  protected readonly issueTypeCopy = issueTypeCopy;
  protected isLoading = true;
  protected error: string | null = null;
  protected updatingIssues = new Set<string>();
  protected filteredIssues = computed(() => this.applyFilters());
  protected aiSummaryExpanded = false;
  protected exportStatus: Record<'pdf' | 'html', 'idle' | 'loading' | 'error'> = { pdf: 'idle', html: 'idle' };
  protected exportError: string | null = null;
  protected shareStatus: 'idle' | 'loading' | 'error' | 'ready' = 'idle';
  protected shareLink: string | null = null;

  ngOnInit(): void {
    this.subscriptions.refresh().subscribe();
    this.loadScan();
  }

  loadScan(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid scan ID';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.api.getScan(id).subscribe({
      next: (scan) => {
        this.scan = scan;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err.status === 404
          ? 'Scan not found'
          : 'Failed to load scan details. Please try again.';
      }
    });
  }

  toggle(issue: IssueDetail): void {
    if (!this.scan || this.updatingIssues.has(issue.id)) return;
    if (!this.canEditIssues) {
      this.toasts.push('Active subscription required to update issue status.', 'error');
      return;
    }

    const previousStatus = issue.status;
    const newStatus: 'open' | 'fixed' = previousStatus === 'fixed' ? 'open' : 'fixed';

    issue.status = newStatus;
    this.updatingIssues.add(issue.id);

    this.api.updateIssueStatus(this.scan.id, issue.id, newStatus).subscribe({
      next: (updatedIssue) => {
        this.updatingIssues.delete(issue.id);
        issue.status = updatedIssue.status || newStatus;
        this.toasts.push(
          `Issue marked as ${newStatus}`,
          'success'
        );
      },
      error: () => {
        this.updatingIssues.delete(issue.id);
        issue.status = previousStatus;
        this.toasts.push(
          'Failed to update issue status. Please try again.',
          'error'
        );
      }
    });
  }

  isUpdating(issueId: string): boolean {
    return this.updatingIssues.has(issueId);
  }

  export(format: 'pdf' | 'html'): void {
    if (!this.scan) return;
    this.exportStatus[format] = 'loading';
    this.exportError = null;
    this.api.exportScan(this.scan.id, format).subscribe({
      next: (blob) => {
        const filename = `scan-${this.scan?.id}.${format}`;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
        this.toasts.push(`Exported ${format.toUpperCase()} report`, 'success');
        this.exportStatus[format] = 'idle';
      },
      error: (err: HttpErrorResponse) => {
        this.exportStatus[format] = 'error';
        if (err.status === 404 || err.status === 501) {
          this.exportError = 'Reports are not available yet. Please try again after backend support is enabled.';
        } else {
          this.exportError = err.error?.message || 'Failed to export report.';
        }
        this.toasts.push(this.exportError || 'Failed to export report.', 'error');
      }
    });
  }

  generateShare(): void {
    if (!this.scan) return;
    this.shareStatus = 'loading';
    this.shareLink = null;
    this.api.createShareLink(this.scan.id).subscribe({
      next: (res) => {
        this.shareStatus = 'ready';
        this.shareLink = res.link;
        this.toasts.push('Share link generated', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.shareStatus = 'error';
        const message =
          err.status === 404 || err.status === 501
            ? 'Share links are not available yet. Coordinate with backend to enable.'
            : err.error?.message || 'Failed to generate share link.';
        this.toasts.push(message, 'error');
      }
    });
  }

  copyShare(): void {
    if (!this.shareLink) return;
    navigator.clipboard.writeText(this.shareLink).then(
      () => this.toasts.push('Share link copied', 'success'),
      () => this.toasts.push('Unable to copy share link', 'error')
    );
  }

  get isReadOnly(): boolean {
    return this.subscriptions.isReadOnly();
  }

  get canViewSuggestions(): boolean {
    const status = this.subscriptions.status();
    return status === 'ACTIVE' || status === 'TRIALING' || status === 'PAST_DUE';
  }

  get canEditIssues(): boolean {
    return this.subscriptions.isActive();
  }

  private applyFilters(): IssueDetail[] {
    if (!this.scan) return [];
    return this.scan.issues.filter((issue) => {
      const statusPass = this.filter() === 'all' || issue.status === this.filter();
      const severityPass = this.severityFilter() === 'all' || issue.severity === this.severityFilter();
      const typePass = this.typeFilter() === 'all' || issue.category === this.typeFilter();
      return statusPass && severityPass && typePass;
    });
  }
}
