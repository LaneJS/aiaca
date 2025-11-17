import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { SiteSummary } from '../../core/models';

@Component({
  selector: 'app-script-setup',
  templateUrl: './script-setup.component.html',
  styleUrl: './script-setup.component.scss',
})
export class ScriptSetupComponent {
  protected sites: SiteSummary[] = [];
  protected selected?: SiteSummary;

  constructor(private readonly api: ApiService) {
    this.api.listSites().subscribe((sites) => (this.sites = sites));
  }

  select(siteId: string) {
    this.selected = this.sites.find((s) => s.id === siteId);
  }

  snippet() {
    return `<script src="https://cdn.aaca.com/autofix.js" data-site-id="${this.selected?.id || 'SITE_ID'}"></script>`;
  }

  copy(textarea: HTMLTextAreaElement) {
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
  }
}
