import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ScanSummary, SiteSummary } from '../../core/models';

@Component({
  selector: 'app-scans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scans.component.html',
  styleUrl: './scans.component.scss',
})
export class ScansComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected scans: ScanSummary[] = [];
  protected sites: SiteSummary[] = [];

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
