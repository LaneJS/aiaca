import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  navItems: NavItem[] = [
    { label: 'Overview', path: '/overview', icon: 'dashboard' },
    { label: 'Sites', path: '/sites', icon: 'language' },
    { label: 'Scans', path: '/scans', icon: 'search' },
    { label: 'Script Setup', path: '/script-setup', icon: 'code' },
    { label: 'Account', path: '/account', icon: 'person' },
  ];

  logout(): void {
    this.auth.logout();
  }

  navigate(item: NavItem): void {
    this.router.navigate([item.path]);
  }
}
