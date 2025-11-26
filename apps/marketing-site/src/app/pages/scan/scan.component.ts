import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  
  // Mock progress for visual feedback
  scanProgress = 0;
  scanStatus = 'Initializing...';

  private readonly scanService = inject(ScanService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.seo.update({
      title: 'Free accessibility scan',
      description: 'Run a free accessibility scan, get a score, and preview AI-backed fixes.',
      path: '/scan',
    });

    this.route.queryParams.subscribe(params => {
      if (params['url']) {
        this.url = params['url'];
        this.onSubmit();
      }
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
    this.startFakeProgress();

    this.scanService.submit(trimmedUrl).subscribe({
      next: (response) => {
        this.result = response;
        this.submitting = false;
        this.scanProgress = 100;
      },
      error: () => {
        this.errorMessage = 'We could not reach the scan service. Please try again shortly.';
        this.submitting = false;
        this.scanProgress = 0;
      },
    });
  }

  private startFakeProgress() {
    this.scanProgress = 0;
    const steps = [
      { p: 10, t: 'Connecting to site...' },
      { p: 30, t: 'Downloading content...' },
      { p: 50, t: 'Analyzing DOM structure...' },
      { p: 70, t: 'Checking WCAG 2.1 rules...' },
      { p: 90, t: 'Generating AI suggestions...' },
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (!this.submitting || stepIndex >= steps.length) {
        clearInterval(interval);
        return;
      }
      
      this.scanProgress = steps[stepIndex].p;
      this.scanStatus = steps[stepIndex].t;
      stepIndex++;
    }, 600); 
  }
}
