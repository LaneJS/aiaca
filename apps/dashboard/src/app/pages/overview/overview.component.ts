import { Component, OnInit, computed, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { OnboardingStep, ScanSummary, SiteSummary } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-overview',
  standalone: false,
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  protected sites = signal<SiteSummary[]>([]);
  protected scans = signal<ScanSummary[]>([]);

  protected onboarding = computed<OnboardingStep[]>(() => {
    const hasSite = this.sites().length > 0;
    const hasScan = this.scans().length > 0;
    const hasEmbed = this.sites().some((s) => s.embedKey);
    return [
      {
        id: 'site',
        label: 'Add your first site',
        description: 'Tell us which domain to watch for accessibility issues.',
        completed: hasSite,
      },
      {
        id: 'scan',
        label: 'Run a baseline scan',
        description: 'Run at least one scan to capture your current score.',
        completed: hasScan,
      },
      {
        id: 'script',
        label: 'Install the embed script',
        description: 'Drop in the script snippet to receive auto-fix patches.',
        completed: hasEmbed,
      },
    ];
  });

  protected averageScore = computed(() => {
    const list = this.scans();
    if (!list.length) return 0;
    const total = list.reduce((t, s) => t + s.score, 0);
    return Math.round(total / list.length);
  });

  constructor(private readonly api: ApiService, private readonly toasts: ToastService) {}

  ngOnInit(): void {
    this.api.listSites().subscribe((sites) => this.sites.set(sites));
    this.api.listScans().subscribe((scans) => this.scans.set(scans));
  }

  runScan(siteId: string) {
    this.api.triggerScan(siteId).subscribe(() => {
      this.toasts.push('Scan queued', 'success');
      this.api.listScans(siteId).subscribe((scans) => this.scans.set([...this.scans(), ...scans]));
    });
  }

  getSiteName(siteId: string): string {
    return this.sites().find((s) => s.id === siteId)?.name || 'Unknown';
  }
}
