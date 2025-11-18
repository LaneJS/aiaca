import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { SiteSummary } from '../../core/models';

@Component({
  selector: 'app-script-setup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './script-setup.component.html',
  styleUrl: './script-setup.component.scss',
})
export class ScriptSetupComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected sites: SiteSummary[] = [];
  protected selected?: SiteSummary;

  ngOnInit(): void {
    this.api.listSites().subscribe((sites) => (this.sites = sites));
  }

  select(siteId: string) {
    this.selected = this.sites.find((s) => s.id === siteId);
  }

  snippet() {
    return `<script src="https://cdn.A11yAssistant.com/autofix.js" data-site-id="${this.selected?.id || 'SITE_ID'}"></script>`;
  }

  copy(textarea: HTMLTextAreaElement) {
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
  }
}
