import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  readonly navLinks: NavLink[] = [
    { label: 'Overview', path: '/', description: 'Payments and health' },
    { label: 'Accounts', path: '/accounts', description: 'Buyers & seats' },
    { label: 'Payments', path: '/payments', description: 'Invoices' },
    { label: 'Plans', path: '/plans', description: 'Packaging' },
  ];
}
