import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScanService, PublicScanResponse } from '../../services/scan.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-scan-page',
  standalone: true,
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, CTAButtonComponent],
})
export class ScanComponent implements OnInit {
  url = '';
  submitting = false;
  errorMessage = '';
  result?: PublicScanResponse;

  private readonly scanService = inject(ScanService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  // Features displayed below the form
  readonly scanFeatures: { title: string; description: string; icon: SafeHtml }[] = [];

  constructor() {
    this.initializeFeatures();
  }

  private initializeFeatures(): void {
    const featuresData = [
      {
        title: 'Instant Results',
        description: 'Get your accessibility score and top issues in under 60 seconds.',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
      },
      {
        title: 'WCAG Coverage',
        description: '50+ checks covering WCAG 2.1 Level AA guidelines.',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
      {
        title: 'AI Explanations',
        description: 'Each issue includes plain-English explanations powered by AI.',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      },
      {
        title: 'No Account Required',
        description: "Start scanning immediately. We'll never spam you.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7V12C3 16.9706 7.02944 21 12 22C16.9706 21 21 16.9706 21 12V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
    ];

    this.scanFeatures.push(...featuresData.map(f => ({
      ...f,
      icon: this.sanitizer.bypassSecurityTrustHtml(f.icon),
    })));
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Free Accessibility Scan',
      description: 'Scan your website for accessibility issues. Get an instant score and AI-powered fix suggestions. No account required.',
      path: '/scan',
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    const trimmedUrl = this.url.trim();

    if (!trimmedUrl) {
      this.errorMessage = 'Please enter a valid URL to scan.';
      return;
    }

    this.submitting = true;
    this.result = undefined;

    this.scanService.submit(trimmedUrl).subscribe({
      next: (response) => {
        this.result = response;
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'We could not reach the scan service. Please check the URL and try again.';
        this.submitting = false;
      },
    });
  }

  // Score ring helpers
  getScoreClass(): string {
    if (!this.result) return '';
    const score = this.result.score;
    if (score >= 90) return 'results-score__ring--excellent';
    if (score >= 70) return 'results-score__ring--good';
    if (score >= 50) return 'results-score__ring--fair';
    return 'results-score__ring--poor';
  }

  getScoreDescription(): string {
    if (!this.result) return '';
    const score = this.result.score;
    if (score >= 90) return 'Excellent! Your site is highly accessible.';
    if (score >= 70) return 'Good progress. A few issues to address.';
    if (score >= 50) return 'Needs attention. Several accessibility gaps.';
    return 'Significant issues found. Immediate action recommended.';
  }

  getStrokeDasharray(): string {
    const circumference = 2 * Math.PI * 52;
    return `${circumference}`;
  }

  getStrokeDashoffset(): string {
    if (!this.result) return '327';
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (this.result.score / 100) * circumference;
    return `${offset}`;
  }
}
