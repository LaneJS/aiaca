import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DemoIssue {
  title: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  autoFix: string;
}

interface Suggestion {
  label: string;
  detail: string;
  impact: string;
}

declare global {
  interface Window {
    AACAEmbedDemo?: {
      enable: () => void;
      disable: () => void;
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected autofixEnabled = false;
  protected embedSnippet = `<script\n  src="https://cdn.aaca-demo.com/embed.js"\n  data-site-id="your-site-id"\n  data-embed-key="public-key-from-your-dashboard"\n  data-api-base="https://api.aaca.yourdomain.com"\n></script>`;

  protected demoAccount = {
    name: 'Demo Bakery',
    domain: 'brokenbakery.aiaca.demo',
    lastScan: '4 hours ago',
    score: '58 / 100',
  };

  protected scanFindings: DemoIssue[] = [
    {
      title: 'Missing alternative text on the bakery display',
      severity: 'critical',
      description:
        'The loudest visuals have no alt text, so screen reader users get silence instead of context.',
      autoFix:
        'Writes in AI-generated alt text from the latest scan so people who rely on assistive tech know what is shown.',
    },
    {
      title: 'Ghost CTA without focus styles',
      severity: 'serious',
      description:
        'Focus outlines were stripped out, so keyboard users cannot tell where they are on the page.',
      autoFix:
        'Restores visible focus indicators and keeps your existing layout untouched.',
    },
    {
      title: 'Low contrast muted copy',
      severity: 'moderate',
      description:
        'Muted grey text on a grey background fails WCAG 2.1 contrast ratios across multiple sections.',
      autoFix:
        'Applies a high-contrast palette to muted copy and ghost buttons so visitors can actually read them.',
    },
    {
      title: 'Unlabeled form controls',
      severity: 'serious',
      description:
        'Newsletter inputs rely on placeholder-only hints and have no programmatic labels.',
      autoFix:
        'Adds aria-labels using scan recommendations and placeholder context so screen readers announce each field.',
    },
  ];

  protected aiSuggestions: Suggestion[] = [
    {
      label: '“Pastry case with macarons and fruit tarts”',
      detail:
        'AI orchestrator suggestion for the bakery display images, generated from the scan context and screenshot.',
      impact: 'Stops screen reader silence and resolves WCAG 1.1.1.',
    },
    {
      label: 'Inject “Skip to main content” link',
      detail:
        'Adds a persistent shortcut to jump past the noisy banner so the page is immediately usable with a keyboard.',
      impact: 'Meets WCAG 2.4.1 for keyboard navigation and improves usability instantly.',
    },
    {
      label: 'Restore focus outlines in brand purple',
      detail:
        'Applies consistent, high-contrast outlines for every interactive control without touching your component code.',
      impact: 'Addresses WCAG 2.4.7 focus visibility issues and reduces user drop-off.',
    },
    {
      label: 'Upgrade muted text contrast',
      detail:
        'Auto-applies a high-contrast palette while leaving layout untouched so calls-to-action stand out.',
      impact: 'Resolves WCAG 1.4.3 failures called out in the scan and keeps your brand legible.',
    },
  ];

  ngOnInit(): void {
    const embedAvailable = Boolean(window?.AACAEmbedDemo);

    if (embedAvailable) {
      window.AACAEmbedDemo?.disable();
    }

    this.autofixEnabled = false;
  }

  protected toggleAutoFix(): void {
    if (!window?.AACAEmbedDemo) {
      this.autofixEnabled = false;
      return;
    }

    if (this.autofixEnabled) {
      window.AACAEmbedDemo.disable();
    } else {
      window.AACAEmbedDemo.enable();
    }

    this.autofixEnabled = !this.autofixEnabled;
  }
}
