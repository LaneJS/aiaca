import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { IssueDetail, ScanDetail } from '../../core/models';
import { issueTypeCopy, severityCopy } from './copy';

@Component({
  selector: 'app-scan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan-detail.component.html',
  styleUrl: './scan-detail.component.scss',
})
export class ScanDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected scan?: ScanDetail;
  protected filter: 'all' | 'open' | 'fixed' = 'all';
  protected readonly severityCopy = severityCopy;
  protected readonly severityOrder: Array<keyof typeof severityCopy> = ['high', 'medium', 'low'];
  protected readonly issueTypeCopy = issueTypeCopy;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getScan(id).subscribe((scan) => (this.scan = scan));
    }
  }

  issues(): IssueDetail[] {
    if (!this.scan) return [];
    if (this.filter === 'all') return this.scan.issues;
    return this.scan.issues.filter((i) => i.status === this.filter);
  }

  toggle(issue: IssueDetail) {
    issue.status = issue.status === 'fixed' ? 'open' : 'fixed';
  }
}
