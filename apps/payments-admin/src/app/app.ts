import { Component } from '@angular/core';

interface NavLink {
  label: string;
  path: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: false,
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
