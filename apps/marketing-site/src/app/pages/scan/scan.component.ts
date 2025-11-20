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
}
