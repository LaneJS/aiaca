import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PlansComponent } from './pages/plans/plans.component';

export const appRoutes: Route[] = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'accounts', component: AccountsComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'plans', component: PlansComponent },
  { path: '**', redirectTo: '' },
];
