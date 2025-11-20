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
  protected autofixEnabled = true;
  protected embedSnippet = `<script\n  src="/embed/autofix-demo.js"\n  data-site-id="demo-site-001"\n  data-embed-key="demo-embed-key"\n  data-api-base="https://api.aaca.local"\n></script>`;

  protected demoAccount = {
    name: 'Demo Bakery',
    domain: 'brokenbakery.aiaca.demo',
    siteId: 'demo-site-001',
    embedKey: 'demo-embed-key',
    lastScan: '4 hours ago',
    score: '58 / 100',
  };

  protected scanFindings: DemoIssue[] = [
    {
      title: 'Missing alternative text on hero imagery',
      severity: 'critical',
      description:
        'Two hero images ship without any alt attributes. Screen reader users get silence.',
      autoFix: 'Injects AI alt text from the latest scan suggestions.',
    },
    {
      title: 'Ghost CTA without focus styles',
      severity: 'serious',
      description:
        'Keyboard users cannot see where focus is because outlines are globally removed.',
      autoFix: 'Restores visible focus indicators with the embed CSS patch.',
    },
    {
      title: 'Low contrast muted copy',
      severity: 'moderate',
      description:
        'Muted grey text on a grey background fails WCAG 2.1 contrast ratios on multiple sections.',
      autoFix: 'Applies high-contrast tokens and boldens the muted text.',
    },
    {
      title: 'Unlabeled form controls',
      severity: 'serious',
      description:
        'Newsletter form fields rely on placeholder-only hints and have no programmatic labels.',
      autoFix: 'Adds aria-labels using scan recommendations and placeholder context.',
    },
  ];

  protected aiSuggestions: Suggestion[] = [
    {
      label: '“Pastry case with macarons and fruit tarts”',
      detail: 'Generated alt text for the hero gallery images.',
      impact: 'Stops screen reader silence and resolves WCAG 1.1.1.',
    },
    {
      label: 'Inject skip link to #main-content',
      detail: 'Ensures keyboard users can bypass the chaotic hero region.',
      impact: 'Meets WCAG 2.4.1 for keyboard navigation.',
    },
    {
      label: 'Restore focus outlines in brand purple',
      detail: 'Applies consistent outlines for all interactive controls.',
      impact: 'Addresses WCAG 2.4.7 focus visibility issues.',
    },
    {
      label: 'Upgrade muted text contrast',
      detail: 'Auto-applies high-contrast palette while leaving layout untouched.',
      impact: 'Resolves WCAG 1.4.3 failures called out in the scan.',
    },
  ];

  ngOnInit(): void {
    this.autofixEnabled = Boolean(window?.AACAEmbedDemo);
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
