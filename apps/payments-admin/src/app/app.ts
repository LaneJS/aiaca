import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { AuthService } from './core/auth/auth.service';
import { LoadingService } from './core/state/loading.service';
import { APP_CONFIG } from './core/config/app-config';

interface NavLink {
  label: string;
  path: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly loading = inject(LoadingService);
  private readonly appConfig = inject(APP_CONFIG);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly navLinks: NavLink[] = [
    { label: 'Overview', path: '/', description: 'Payments and health' },
    { label: 'Accounts', path: '/accounts', description: 'Buyers & seats' },
    { label: 'Payments', path: '/payments', description: 'Invoices' },
    { label: 'Plans', path: '/plans', description: 'Packaging' },
    { label: 'Operations', path: '/operations', description: 'Dunning, disputes, webhooks' },
    { label: 'Reporting', path: '/reporting', description: 'Revenue & audit' },
    { label: 'Settings', path: '/settings', description: 'Governance & env' },
  ];

  readonly showShell = computed(() => {
    const url = this.currentUrl();
    return !(url.startsWith('/login') || url.startsWith('/unauthorized'));
  });

  readonly session = this.auth.session;
  readonly isLoading = this.loading.isLoading;
  readonly envName = this.appConfig.environmentName;

  signOut(): void {
    this.auth.logout();
  }
}
