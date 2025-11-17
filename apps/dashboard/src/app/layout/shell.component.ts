import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Overview', path: '/overview', icon: 'dashboard' },
    { label: 'Sites', path: '/sites', icon: 'language' },
    { label: 'Scans', path: '/scans', icon: 'search' },
    { label: 'Script Setup', path: '/script-setup', icon: 'code' },
    { label: 'Account', path: '/account', icon: 'person' },
  ];

  constructor(protected readonly auth: AuthService, private readonly router: Router) {}

  ngOnInit() {
    this.auth.ensureDemoSession();
  }

  logout() {
    this.auth.logout();
  }

  navigate(item: NavItem) {
    this.router.navigate([item.path]);
  }
}
