import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

type Guide = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
};

type FAQ = {
  question: string;
  answer: string;
  linkLabel?: string;
  linkHref?: string;
};

@Component({
  selector: 'app-resources-page',
  standalone: true,
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class ResourcesComponent implements OnInit {
  readonly faqs: FAQ[] = [
    {
      question: 'What is web accessibility?',
      answer:
        'Web accessibility means everyone can perceive, understand, and use your site — including people who rely on screen readers, magnifiers, captions, or keyboard navigation.',
      linkLabel: 'Jump to the report-reading guide',
      linkHref: '#report-guide',
    },
    {
      question: 'Does this guarantee I’ll never be sued?',
      answer:
        'No tool or vendor can promise that. AACA helps you reduce risk with clear evidence: issue lists tied to WCAG, AI suggestions, audit history, and the optional auto-fix script.',
      linkLabel: 'See how we document issues in the dashboard',
      linkHref: '#issue-help',
    },
    {
      question: 'How does the AI auto-fix script work?',
      answer:
        'When installed, the script loads lightweight fixes from your account. It adds skip links, focus styles, and select AI-generated alt text without changing your layout or collecting personal data.',
      linkLabel: 'Read the embed script guide',
      linkHref: '#embed-guide',
    },
  ];

  readonly guides: Guide[] = [
    {
      id: 'report-guide',
      title: 'How to read your accessibility report',
      summary:
        'Understand your score, severity labels, and the issue types that appear in the dashboard. Ideal for sharing with non-technical teammates.',
      steps: [
        'Start with the score and AI summary to see overall risk.',
        'Filter by severity: fix high-impact blockers first, then medium and low.',
        'Use selectors and suggestions to locate the element and copy a fix.',
        'Mark items fixed, rerun a scan, and keep a short changelog for stakeholders.',
      ],
    },
    {
      id: 'embed-guide',
      title: 'How to add the embed script to your site',
      summary:
        'Copy the snippet from the dashboard, paste it before </head>, and verify skip links, focus outlines, and AI alt text appear.',
      steps: [
        'Grab your site ID from Script Setup in the dashboard.',
        'Place the snippet in the head of every page or deploy it through your tag manager.',
        'Test with keyboard navigation and a page that has images to confirm changes.',
        'Re-run a scan to see which items were auto-fixed versus still open.',
      ],
    },
  ];

  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Accessibility resources and FAQs',
      description: 'Learn the basics of accessibility, see FAQs, and preview the guides that ship with AACA.',
      path: '/resources',
    });
  }
}
