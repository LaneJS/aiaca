import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ScanSummary, SiteSummary } from '../../core/models';

@Component({
  selector: 'app-scans',
  standalone: false,
  templateUrl: './scans.component.html',
  styleUrl: './scans.component.scss',
})
export class ScansComponent implements OnInit {
  protected scans: ScanSummary[] = [];
  protected sites: SiteSummary[] = [];

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  ngOnInit(): void {
    this.api.listSites().subscribe((sites) => (this.sites = sites));
    this.api.listScans().subscribe((scans) => (this.scans = scans));
  }

  view(scan: ScanSummary) {
    this.router.navigate(['/scans', scan.id]);
  }

  siteName(scan: ScanSummary) {
    return this.sites.find((s) => s.id === scan.siteId)?.name || 'Unknown';
  }
}
