import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { SiteSummary } from '../../core/models';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss',
})
export class SitesComponent implements OnInit {
  protected sites: SiteSummary[] = [];

  constructor(private readonly api: ApiService, private readonly router: Router, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.api.listSites().subscribe((sites) => (this.sites = sites));
  }

  view(site: SiteSummary) {
    this.router.navigate(['./', site.id], { relativeTo: this.route });
  }
}
