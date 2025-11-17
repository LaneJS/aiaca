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

export const appRoutes: Route[] = [
  { path: 'auth', component: AuthComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: OverviewComponent },
      { path: 'sites', component: SitesComponent },
      { path: 'sites/:id', component: SiteDetailComponent },
      { path: 'scans', component: ScansComponent },
      { path: 'scans/:id', component: ScanDetailComponent },
      { path: 'script-setup', component: ScriptSetupComponent },
      { path: 'account', component: AccountComponent },
    ],
  },
];
