import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class PricingComponent implements OnInit {
  readonly plans = [
    {
      name: 'Free scan',
      price: '$0',
      description: 'Top issues for one URL and AI-backed guidance to get unstuck.',
      features: ['Accessibility score', 'Top 5 issues', 'Plain-language explanations'],
      cta: 'Run a free scan',
      routerLink: '/scan',
    },
    {
      name: 'Starter',
      price: 'From $39/mo',
      description: 'For small teams shipping updates weekly and needing compliance guardrails.',
      features: [
        'Unlimited URLs',
        'Full issue list + AI suggestions',
        'Auto-fix script access',
        'Monitoring and alerts',
      ],
      cta: 'Talk to us',
      href: 'mailto:sales@aaca.test',
    },
  ];

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Pricing for accessibility monitoring',
      description: 'Start with a free scan and upgrade to monitoring and the auto-fix script when you are ready.',
      path: '/pricing',
    });
  }
}
