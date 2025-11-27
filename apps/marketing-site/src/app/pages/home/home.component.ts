import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class HomeComponent implements OnInit {
  readonly steps = [
    {
      title: 'Scan live pages',
      description: 'Headless browser + axe-core coverage with screenshots for context.',
    },
    {
      title: 'Explain & prioritize',
      description: 'Plain-language summaries, severity, and impacted users for every issue.',
    },
    {
      title: 'Auto-fix & monitor',
      description: 'Optional script repairs common gaps while alerts keep regressions out.',
    },
  ];

  readonly features = [
    {
      title: 'Accessibility radar',
      copy: 'Covers headings, landmarks, color contrast, keyboard traps, and media alternatives.',
    },
    {
      title: 'AI that speaks human',
      copy: 'Fix-ready snippets with the why, so non-experts can act confidently.',
    },
    {
      title: 'Auto-fix script',
      copy: 'Optionally inject a light script to add skip links, focus states, and safe alt text.',
    },
    {
      title: 'Monitoring & alerts',
      copy: 'Track regressions over time and keep stakeholders aligned with shareable reports.',
    },
  ];

  readonly issueSpotlight = [
    {
      name: 'Missing alt text',
      impact: 'Screen readers announce “image” with no context.',
      fix: 'AI proposes contextual alt text with the visible headline nearby.',
      status: 'Auto-fix ready',
    },
    {
      name: 'Button without label',
      impact: 'Keyboard users land on unlabeled controls.',
      fix: 'We surface the DOM path and a suggested aria-label.',
      status: 'Guided fix',
    },
    {
      name: 'Low contrast CTA',
      impact: 'Users with low vision miss the primary action.',
      fix: 'Contrast-safe color suggestion with WCAG ratio proof.',
      status: 'Visual QA',
    },
  ];

  readonly stats = [
    { label: 'Manual QA hours saved', value: '8+ hrs / week' },
    { label: 'Critical issues caught', value: '92% of top errors' },
    { label: 'Embed weight', value: '<12kb, no tracking' },
  ];

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Accessibility that shows its work | AACA',
      description:
        'Run a free accessibility scan, see prioritized issues, and get AI-powered fixes built for small business websites.',
      path: '/',
    });
  }
}
