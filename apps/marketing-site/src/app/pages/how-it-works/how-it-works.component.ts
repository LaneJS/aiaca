import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-how-it-works-page',
  standalone: true,
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  imports: [CommonModule, RouterModule, CTAButtonComponent],
})
export class HowItWorksComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly steps: { title: string; body: string; visual: SafeHtml }[] = [];
  readonly checkCategories: { title: string; icon: SafeHtml; items: string[] }[] = [];

  readonly commitments = [
    'Plain-language explanations for every issue found.',
    'Keyboard-friendly navigation and strong focus indicators.',
    'Built-in skip links and semantic HTML landmarks.',
    'Accessible defaults for all shared components.',
    'Regular accessibility audits on our own product.',
  ];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const stepsData = [
      {
        title: 'Run a scan',
        body: 'Enter any URL. Our engine launches a headless browser, applies 50+ WCAG rules, and captures context for AI-powered suggestions.',
        visual: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="48" rx="6" stroke="currentColor" stroke-width="2"/><path d="M24 24H40M24 32H40M24 40H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="48" r="12" fill="currentColor" opacity="0.1"/><path d="M48 44V52M44 48H52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
      {
        title: 'Review prioritized issues',
        body: 'See severity levels, impacted elements, and clear explanations of why each issue matters. High-priority items surface first.',
        visual: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="12" rx="2" stroke="currentColor" stroke-width="2"/><rect x="8" y="28" width="48" height="12" rx="2" stroke="currentColor" stroke-width="2" opacity="0.6"/><rect x="8" y="44" width="48" height="12" rx="2" stroke="currentColor" stroke-width="2" opacity="0.3"/><circle cx="16" cy="18" r="3" fill="currentColor"/></svg>`,
      },
      {
        title: 'Apply fixes with AI help',
        body: 'Get AI-generated alt text, improved link labels, or CSS tweaks. Copy code snippets or add the auto-fix script for instant improvements.',
        visual: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M16 32L28 44L48 20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" opacity="0.3"/></svg>`,
      },
      {
        title: 'Monitor for regressions',
        body: 'Set up continuous monitoring to catch new issues as they appear. Get weekly reports and instant alerts when accessibility scores drop.',
        visual: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M8 48L20 36L32 42L44 26L56 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="36" r="4" fill="currentColor"/><circle cx="32" cy="42" r="4" fill="currentColor"/><circle cx="44" cy="26" r="4" fill="currentColor"/></svg>`,
      },
    ];

    this.steps.push(...stepsData.map(s => ({
      ...s,
      visual: this.sanitizer.bypassSecurityTrustHtml(s.visual),
    })));

    const categoriesData = [
      {
        title: 'Visual',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2"/></svg>`,
        items: ['Color contrast ratios', 'Focus indicators', 'Text spacing', 'Animation controls'],
      },
      {
        title: 'Structure',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="10" width="8" height="11" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="10" width="7" height="11" rx="1" stroke="currentColor" stroke-width="2"/></svg>`,
        items: ['Heading hierarchy', 'Landmark regions', 'List structure', 'Table headers'],
      },
      {
        title: 'Content',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 8H17M7 12H13M7 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        items: ['Image alt text', 'Link purpose', 'Error messages', 'Language attributes'],
      },
      {
        title: 'Interactive',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/><path d="M11 15L21 5M21 5H15M21 5V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        items: ['Keyboard navigation', 'Form labels', 'Button names', 'ARIA attributes'],
      },
    ];

    this.checkCategories.push(...categoriesData.map(c => ({
      ...c,
      icon: this.sanitizer.bypassSecurityTrustHtml(c.icon),
    })));
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'How A11y Assistant Works',
      description: 'Learn how our accessibility scanner, AI suggestions, and auto-fix script help you achieve WCAG compliance in minutes.',
      path: '/how-it-works',
    });
  }
}
