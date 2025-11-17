import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CTAButtonComponent } from '@aiaca/ui';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CTAButtonComponent],
})
export class SiteHeaderComponent {
  isMenuOpen = false;

  readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'How it works', path: '/how-it-works' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Resources', path: '/resources' },
  ];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
