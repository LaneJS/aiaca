import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterModule, CTAButtonComponent],
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  // Demo score for the hero card
  demoScore = 67;

  // Stats for urgency section
  readonly stats: { value: string; label: string; icon: SafeHtml }[] = [];

  // Process steps
  readonly steps: { title: string; description: string; visual: SafeHtml }[] = [];

  // Feature cards
  readonly features: { title: string; copy: string; icon: SafeHtml; tag?: string }[] = [];

  // Testimonials
  readonly testimonials = [
    {
      quote: "We had no idea our site had 47 accessibility issues. A11y Assistant found them all and helped us fix the critical ones in an afternoon.",
      name: "Sarah Chen",
      role: "Owner, Bloom Bakery",
      initials: "SC",
    },
    {
      quote: "As a developer managing 12 client sites, this tool saves me hours every week. The AI suggestions are actually useful.",
      name: "Marcus Rodriguez",
      role: "Freelance Developer",
      initials: "MR",
    },
    {
      quote: "We got a demand letter and panicked. A11y Assistant helped us get compliant before the deadline. Worth every penny.",
      name: "James Kim",
      role: "COO, TechStart Inc",
      initials: "JK",
    },
  ];

  // Trust badges
  readonly trustBadges: { text: string; icon: SafeHtml }[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize stats with sanitized icons
    const statsData = [
      {
        value: "4,000+",
        label: "ADA lawsuits filed in 2023",
        icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4L4 10V22L16 28L28 22V10L16 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 16L4 10M16 16V28M16 16L28 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
      },
      {
        value: "1 in 4",
        label: "Adults have a disability",
        icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="10" r="4" stroke="currentColor" stroke-width="2"/><path d="M8 28V24C8 21.7909 9.79086 20 12 20H20C22.2091 20 24 21.7909 24 24V28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
      {
        value: "$50K+",
        label: "Average settlement cost",
        icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4V28M22 8H13C10.7909 8 9 9.79086 9 12C9 14.2091 10.7909 16 13 16H19C21.2091 16 23 17.7909 23 20C23 22.2091 21.2091 24 19 24H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
    ];

    this.stats.push(...statsData.map(s => ({
      ...s,
      icon: this.sanitizer.bypassSecurityTrustHtml(s.icon),
    })));

    // Initialize features
    const featuresData = [
      {
        title: "Smart Scanning",
        copy: "Comprehensive WCAG audits covering contrast, headings, alt text, keyboard navigation, and more.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
      {
        title: "AI Explanations",
        copy: "Every issue explained in plain English with specific, actionable fix recommendations.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        tag: "AI-Powered",
      },
      {
        title: "Auto-Fix Script",
        copy: "Inject a lightweight script to automatically fix common issues like skip links and focus states.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
        tag: "One-Click Fix",
      },
      {
        title: "Continuous Monitoring",
        copy: "Get alerts when new issues appear. Never let regressions slip through unnoticed.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
    ];

    this.features.push(...featuresData.map(f => ({
      ...f,
      icon: this.sanitizer.bypassSecurityTrustHtml(f.icon),
    })));

    // Initialize steps
    const stepsData = [
      {
        title: "Scan",
        description: "Enter your URL and our engine crawls your pages, running 50+ WCAG checks in real-time.",
        visual: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/><path d="M18 18H30M18 24H30M18 30H24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="36" r="8" fill="currentColor" opacity="0.1"/><path d="M36 33V39M33 36H39" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
      {
        title: "Fix",
        description: "Review prioritized issues with AI-generated solutions. Copy code snippets or enable auto-fix.",
        visual: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M12 24L20 32L36 16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" opacity="0.3"/></svg>`,
      },
      {
        title: "Monitor",
        description: "Set up continuous monitoring. Get weekly reports and instant alerts on new violations.",
        visual: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M6 36L14 28L22 32L30 20L42 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="28" r="3" fill="currentColor"/><circle cx="22" cy="32" r="3" fill="currentColor"/><circle cx="30" cy="20" r="3" fill="currentColor"/></svg>`,
      },
    ];

    this.steps.push(...stepsData.map(s => ({
      ...s,
      visual: this.sanitizer.bypassSecurityTrustHtml(s.visual),
    })));

    // Initialize trust badges
    const badgesData = [
      {
        text: "WCAG 2.1 Compliant",
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
      {
        text: "SOC 2 Type II",
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6V10C3 14.4183 6.13401 18.1365 10 19C13.866 18.1365 17 14.4183 17 10V6L10 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
      },
      {
        text: "256-bit Encryption",
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M6 8V6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6V8" stroke="currentColor" stroke-width="2"/></svg>`,
      },
      {
        text: "99.9% Uptime",
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
    ];

    this.trustBadges.push(...badgesData.map(b => ({
      ...b,
      icon: this.sanitizer.bypassSecurityTrustHtml(b.icon),
    })));
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'AI-Powered Accessibility Compliance for Small Businesses',
      description:
        'Scan your website for accessibility issues, get AI-powered fix suggestions, and become WCAG compliant in minutes. Free scan available.',
      path: '/',
    });
  }

  // Score ring helpers
  getScoreClass(score: number): string {
    if (score >= 90) return 'demo-score__ring--excellent';
    if (score >= 70) return 'demo-score__ring--good';
    if (score >= 50) return 'demo-score__ring--fair';
    return 'demo-score__ring--poor';
  }

  getStrokeDasharray(): string {
    const circumference = 2 * Math.PI * 52;
    return `${circumference}`;
  }

  getStrokeDashoffset(score: number): string {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    return `${offset}`;
  }
}
