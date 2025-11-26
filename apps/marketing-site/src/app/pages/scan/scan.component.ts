import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';
import { ScanService, PublicScanResponse } from '../../services/scan.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-scan-page',
  standalone: true,
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, CTAButtonComponent],
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

  onSubmit(): void {
    this.errorMessage = '';
    const trimmedUrl = this.url.trim();

    if (!trimmedUrl) {
      this.errorMessage = 'Enter a valid URL to scan.';
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

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-moderate';
    return 'score-poor';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Critical';
  }

  getScoreDescription(score: number): string {
    if (score >= 80) return 'Your site meets most accessibility standards';
    if (score >= 50) return 'Several issues need attention';
    return 'Significant accessibility barriers found';
  }

  getScoreDashArray(score: number): string {
    const circumference = 2 * Math.PI * 52;
    const progress = (score / 100) * circumference;
    return `${progress} ${circumference}`;
  }
}
