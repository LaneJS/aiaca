import { Route } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ScanDetailComponent } from './pages/scans/scan-detail.component';
import { ScansComponent } from './pages/scans/scans.component';
import { ScriptSetupComponent } from './pages/script-setup/script-setup.component';
import { SiteDetailComponent } from './pages/sites/site-detail.component';
import { SitesComponent } from './pages/sites/sites.component';
import { SubscriptionGuard } from './core/subscription.guard';

export const appRoutes: Route[] = [
  { path: 'auth', component: AuthComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: OverviewComponent },
      { path: 'sites', component: SitesComponent, canActivate: [SubscriptionGuard], data: { allowReadOnly: true } },
      { path: 'sites/:id', component: SiteDetailComponent, canActivate: [SubscriptionGuard], data: { allowReadOnly: true } },
      { path: 'scans', component: ScansComponent, canActivate: [SubscriptionGuard], data: { allowReadOnly: true } },
      { path: 'scans/:id', component: ScanDetailComponent, canActivate: [SubscriptionGuard], data: { allowReadOnly: true } },
      { path: 'script-setup', component: ScriptSetupComponent, canActivate: [SubscriptionGuard], data: { requiresActive: true } },
      { path: 'account', component: AccountComponent },
    ],
  },
];
