import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { ScanComponent } from './pages/scan/scan.component';
import { SignupComponent } from './pages/signup/signup.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'scan', component: ScanComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'legal/privacy', component: PrivacyComponent },
  { path: 'legal/terms', component: TermsComponent },
  { path: '**', redirectTo: '' },
];
