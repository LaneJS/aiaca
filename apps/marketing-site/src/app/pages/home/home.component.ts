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
  readonly scannerStages = [
    {
      title: 'Headings & landmarks',
      description: 'Landmarks mapped, page outline verified.',
      tone: 'good',
    },
    {
      title: 'Contrast',
      description: '3 flagged combinations need attention.',
      tone: 'warn',
    },
    {
      title: 'Keyboard traps',
      description: 'No traps detected on primary flows.',
      tone: 'good',
    },
    {
      title: 'ARIA labels',
      description: '2 empty buttons need labels — AI suggests text.',
      tone: 'warn',
    },
  ];

  readonly beforeAfter = {
    before: [
      {
        title: '“Click here” link',
        description: 'No context for screen readers or SEO. Risky anchor text.',
        tag: 'Confusing',
      },
      {
        title: 'Unnamed form fields',
        description: 'Email input has no label. WCAG 3.3.2 failure.',
        tag: 'Blocking',
      },
      {
        title: 'Missing alt text',
        description: 'Hero banner is invisible to assistive tech and lawsuits love this.',
        tag: 'Risk',
      },
    ],
    after: [
      {
        title: 'Actionable links',
        description: '“View catering menu (PDF)” — purpose spoken and indexed.',
        tag: 'Fixed',
      },
      {
        title: 'Guided form labels',
        description: 'AI suggests “Work email” with helper text for clarity.',
        tag: 'Guided',
      },
      {
        title: 'Meaningful alt text',
        description: '“Barista pouring latte art in a ceramic cup” generated and applied.',
        tag: 'Auto',
      },
    ],
  };

  readonly momentumStats = [
    { value: '48s', label: 'Average free scan turnaround' },
    { value: '92%', label: 'Critical issues resolved by the auto-fix script' },
    { value: 'WCAG 2.2', label: 'Coverage mapped to compliance language' },
  ];

  readonly promises = [
    'Plain-language explanations for every issue and every role.',
    'Deterministic AI: suggestions must match the DOM snapshot we validate.',
    'Optional auto-fix script stays lightweight and privacy-friendly.',
  ];

  viewMode: 'before' | 'after' = 'before';

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'A11y Assistant — compliance clarity without hiring a specialist',
      description:
        'Run a free accessibility scan, watch the fixes, and keep shipping with confidence. Built for small teams that need WCAG/ADA wins fast.',
      path: '/',
    });
  }

  setViewMode(mode: 'before' | 'after'): void {
    this.viewMode = mode;
  }
}
