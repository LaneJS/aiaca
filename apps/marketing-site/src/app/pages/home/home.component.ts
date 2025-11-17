import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class HomeComponent implements OnInit {
  readonly steps = [
    {
      title: 'Scan',
      description: 'Run an automated audit with WCAG rules and real-browser context.',
    },
    {
      title: 'Fix',
      description: 'Prioritize issues with AI guidance and clear, plain-language explanations.',
    },
    {
      title: 'Stay compliant',
      description: 'Monitor new pages, ship changes with confidence, and export reports.',
    },
  ];

  readonly features = [
    {
      title: 'Accessibility scanner',
      copy: 'Covers headings, landmarks, color contrast, keyboard traps, and media alternatives.',
    },
    {
      title: 'AI suggestions',
      copy: 'Get fix-ready snippets or suggested alt text, tailored to the exact node in your DOM.',
    },
    {
      title: 'Auto-fix script',
      copy: 'Optionally inject a light script to add skip links, focus states, and safe alt text.',
    },
    {
      title: 'Monitoring & alerts',
      copy: 'Track regressions over time and keep stakeholders aligned with shareable reports.',
    },
  ];

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'AI-powered accessibility compliance for small websites',
      description:
        'Run a free accessibility scan, see prioritized issues, and get AI-powered fixes built for small business websites.',
      path: '/',
    });
  }
}
