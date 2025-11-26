import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  imports: [CommonModule, RouterModule, CTAButtonComponent],
})
export class PricingComponent implements OnInit {
  private readonly seo = inject(SeoService);

  // Comparison table data
  readonly comparisonRows: { feature: string; free: boolean | string; starter: boolean | string }[] = [
    { feature: 'URL scans', free: '1', starter: 'Unlimited' },
    { feature: 'Issues shown', free: 'Top 5', starter: 'All' },
    { feature: 'AI explanations', free: true, starter: true },
    { feature: 'AI fix suggestions', free: false, starter: true },
    { feature: 'Auto-fix script', free: false, starter: true },
    { feature: 'Continuous monitoring', free: false, starter: true },
    { feature: 'Regression alerts', free: false, starter: true },
    { feature: 'Export reports', free: false, starter: true },
    { feature: 'Priority support', free: false, starter: true },
  ];

  // FAQ items
  readonly faqItems = [
    {
      question: 'Does the free scan include AI suggestions?',
      answer: 'The free scan includes AI-powered explanations for each issue found, helping you understand what needs to be fixed. Full AI fix suggestions with code snippets are available with the Starter plan.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! Plans are month-to-month with no long-term contracts. Cancel anytime from your dashboard with no questions asked.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.',
    },
    {
      question: 'Do you handle privacy-sensitive pages?',
      answer: 'We take privacy seriously. Our scanner only analyzes publicly accessible pages. We never store form data or attempt to access logged-in areas. See our privacy policy for full details.',
    },
    {
      question: 'What WCAG guidelines do you check?',
      answer: 'We check against WCAG 2.1 Level A and AA success criteria, covering contrast, headings, alt text, keyboard navigation, ARIA labels, and more than 50 individual checks.',
    },
    {
      question: 'How does the auto-fix script work?',
      answer: 'The auto-fix script is a lightweight JavaScript snippet you add to your site. It automatically adds skip links, improves focus states, and applies common accessibility fixes without changing your source code.',
    },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Pricing - Simple Plans for Every Team',
      description: 'Start with a free accessibility scan. Upgrade to unlimited scans, AI fix suggestions, and continuous monitoring for $39/month.',
      path: '/pricing',
    });
  }
}
