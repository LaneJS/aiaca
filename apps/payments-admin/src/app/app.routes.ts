import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PlansComponent } from './pages/plans/plans.component';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent),
    data: { layout: 'auth' },
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/auth/unauthorized.component').then((m) => m.UnauthorizedComponent),
    data: { layout: 'auth' },
  },
  {
    path: '',
    canMatch: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
    children: [
      { path: '', component: DashboardComponent, pathMatch: 'full' },
      { path: 'accounts', component: AccountsComponent, canMatch: [roleGuard], data: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] } },
      {
        path: 'accounts/:id',
        canMatch: [roleGuard],
        data: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
        loadComponent: () => import('./pages/accounts/account-detail.component').then((m) => m.AccountDetailComponent),
      },
      { path: 'payments', component: PaymentsComponent, canMatch: [roleGuard], data: { roles: ['ADMIN', 'OPERATOR'] } },
      { path: 'plans', component: PlansComponent, canMatch: [roleGuard], data: { roles: ['ADMIN', 'OPERATOR'] } },
      {
        path: 'operations',
        canMatch: [roleGuard],
        data: { roles: ['ADMIN', 'OPERATOR'] },
        loadComponent: () => import('./pages/operations/operations-center.component').then((m) => m.OperationsCenterComponent),
      },
      {
        path: 'reporting',
        canMatch: [roleGuard],
        data: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
        loadComponent: () => import('./pages/reporting/reporting.component').then((m) => m.ReportingComponent),
      },
      {
        path: 'settings',
        canMatch: [roleGuard],
        data: { roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
