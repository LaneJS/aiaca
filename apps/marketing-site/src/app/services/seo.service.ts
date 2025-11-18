import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoConfig {
  title: string;
  description: string;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly baseUrl =
    (typeof window !== 'undefined' && window.location.origin) || 'https://A11yAssistant.com';
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(config: SeoConfig): void {
    const fullTitle = `${config.title} | A11y Assistant`;
    const url = `${this.baseUrl}${config.path ?? ''}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }
}
