import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-how-it-works-page',
  standalone: true,
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class HowItWorksComponent implements OnInit {
  readonly steps = [
    {
      title: '1. Run a scan',
      body: 'Point us at one URL. We launch a headless browser, apply axe-core rules, and capture screenshots for AI context.',
    },
    {
      title: '2. Review prioritized issues',
      body: 'See severity, location, and the business impact in plain language. Top issues stay free.',
    },
    {
      title: '3. Apply fixes with help',
      body: 'Use AI-authored alt text, improved link labels, or CSS tweaks. Add the auto-fix script for quick, reversible wins.',
    },
    {
      title: '4. Monitor changes',
      body: 'Upgrade to monitor new pages, export reports, and keep regressions from sneaking in.',
    },
  ];

  readonly commitments = [
    'Plain-language explanations for every issue.',
    'Deterministic AI suggestions tied to the scanned DOM.',
    'Keyboard-friendly navigation and strong focus styles.',
    'Lightweight auto-fix script that respects your design.',
  ];

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'How AACA works',
      description:
        'See how the free scan, AI suggestions, and optional auto-fix script help you reach accessibility compliance.',
      path: '/how-it-works',
    });
  }
}
