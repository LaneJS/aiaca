import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CTAButtonComponent } from '@aiaca/ui';
import { ScanService, PublicScanResponse } from '../../services/scan.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-scan-page',
  standalone: true,
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  imports: [CommonModule, FormsModule, CTAButtonComponent],
})
export class ScanComponent implements OnInit {
  url = '';
  submitting = false;
  errorMessage = '';
  result?: PublicScanResponse;

  private readonly scanService = inject(ScanService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Free accessibility scan',
      description: 'Run a free accessibility scan, get a score, and preview AI-backed fixes.',
      path: '/scan',
    });
  }

  getScoreColor(): string {
    if (!this.result) return '#e7e5e4';
    const score = this.result.score;
    if (score >= 90) return '#059669'; // Emerald - Excellent
    if (score >= 70) return '#10b981'; // Light emerald - Good
    if (score >= 50) return '#d97706'; // Amber - Needs work
    return '#dc2626'; // Red - Critical
  }

  getScoreDashArray(): string {
    if (!this.result) return '0 283';
    const circumference = 2 * Math.PI * 45; // 283
    const progress = (this.result.score / 100) * circumference;
    return `${progress} ${circumference}`;
  }

  getScoreDescription(): string {
    if (!this.result) return '';
    const score = this.result.score;
    if (score >= 90) return 'Excellent! Your site follows accessibility best practices.';
    if (score >= 70) return 'Good progress. A few issues need attention.';
    if (score >= 50) return 'Needs improvement. Several accessibility barriers found.';
    return 'Critical issues detected. Immediate attention recommended.';
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
        this.errorMessage = 'We could not reach the scan service. Please try again shortly.';
        this.submitting = false;
      },
    });
  }
}
