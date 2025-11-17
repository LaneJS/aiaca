import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Terms of Service (Placeholder)',
      description: 'Rules for using the AACA free scan and paid services.',
      path: '/legal/terms',
    });
  }
}
