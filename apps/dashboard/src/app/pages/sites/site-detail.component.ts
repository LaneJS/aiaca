import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ScanSummary, SiteSummary } from '../../core/models';

@Component({
  selector: 'app-site-detail',
  standalone: false,
  templateUrl: './site-detail.component.html',
  styleUrl: './site-detail.component.scss',
})
export class SiteDetailComponent implements OnInit {
  protected site?: SiteSummary;
  protected scans: ScanSummary[] = [];

  constructor(private readonly api: ApiService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getSite(id).subscribe((site) => (this.site = site));
    this.api.listScans(id).subscribe((scans) => (this.scans = scans));
  }
}
