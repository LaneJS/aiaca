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
      body: 'Point us at one URL. We launch a headless browser, apply axe-core rules, and capture context for AI suggestions.',
    },
    {
      title: '2. Review prioritized issues',
      body: 'See severity, impacted elements, and a clear explanation of why it matters. Top issues stay free.',
    },
    {
      title: '3. Apply fixes with help',
      body: 'Use AI-authored alt text, improved link labels, or CSS tweaks. Add the auto-fix script for quick wins.',
    },
    {
      title: '4. Monitor changes',
      body: 'Upgrade to monitor new pages, export reports, and keep regressions from sneaking in.',
    },
  ];

  readonly commitments = [
    'Plain-language explanations for every issue.',
    'Keyboard-friendly navigation and strong focus styles.',
    'Built-in skip links and semantic landmarks.',
    'Accessible defaults for all shared components.',
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
