import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { IssueDetail, ScanDetail } from '../../core/models';
import { issueTypeCopy, severityCopy } from './copy';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-scan-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './scan-detail.component.html',
  styleUrl: './scan-detail.component.scss',
})
export class ScanDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly toasts = inject(ToastService);

  protected scan?: ScanDetail;
  protected filter: 'all' | 'open' | 'fixed' = 'all';
  protected readonly severityCopy = severityCopy;
  protected readonly severityOrder: Array<keyof typeof severityCopy> = ['high', 'medium', 'low'];
  protected readonly issueTypeCopy = issueTypeCopy;
  protected isLoading = true;
  protected error: string | null = null;
  protected updatingIssues = new Set<string>();

  ngOnInit(): void {
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

  issues(): IssueDetail[] {
    if (!this.scan) return [];
    if (this.filter === 'all') return this.scan.issues;
    return this.scan.issues.filter((i) => i.status === this.filter);
  }

  toggle(issue: IssueDetail): void {
    if (!this.scan || this.updatingIssues.has(issue.id)) return;

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
}
