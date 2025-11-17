import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CTAButtonComponent } from '@aiaca/ui';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  imports: [CommonModule, CTAButtonComponent],
})
export class ResourcesComponent implements OnInit {
  readonly faqs = [
    {
      question: 'What is web accessibility?',
      answer:
        'Accessibility means everyone can use your site. We focus on WCAG standards that improve navigation, readability, and assistive technology support.',
    },
    {
      question: 'Does this guarantee I will never be sued?',
      answer:
        'No tool can promise that, but we give you clear steps, evidence, and monitoring to reduce risk and respond quickly.',
    },
    {
      question: 'How does the auto-fix script work?',
      answer:
        'When enabled, the script safely adds skip links, focus states, and select AI-generated alt text while keeping your design intact.',
    },
  ];

  readonly guides = [
    {
      title: 'How to read your accessibility report',
      summary: 'Understand severity, impacted elements, and how AI suggestions fit into your workflow.',
    },
    {
      title: 'How to add the embed script to your site',
      summary: 'Copy-paste instructions plus quick checks to confirm the script is working.',
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
