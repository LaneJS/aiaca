import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Privacy Policy (Placeholder)',
      description: 'How the AACA marketing site and scanners handle data with a privacy-first posture.',
      path: '/legal/privacy',
    });
  }
}
