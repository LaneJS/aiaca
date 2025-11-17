import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { IssueDetail, ScanDetail } from '../../core/models';
import { issueTypeCopy, severityCopy } from './copy';

@Component({
  selector: 'app-scan-detail',
  standalone: false,
  templateUrl: './scan-detail.component.html',
  styleUrl: './scan-detail.component.scss',
})
export class ScanDetailComponent implements OnInit {
  protected scan?: ScanDetail;
  protected filter: 'all' | 'open' | 'fixed' = 'all';
  protected readonly severityCopy = severityCopy;
  protected readonly severityOrder: Array<keyof typeof severityCopy> = ['high', 'medium', 'low'];
  protected readonly issueTypeCopy = issueTypeCopy;

  constructor(private readonly api: ApiService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getScan(id).subscribe((scan) => (this.scan = scan));
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
