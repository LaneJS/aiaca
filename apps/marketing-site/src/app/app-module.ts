import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { appRoutes } from './app.routes';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { HomeComponent } from './pages/home/home.component';
import { HowItWorksComponent } from './pages/how-it-works/how-it-works.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { ScanComponent } from './pages/scan/scan.component';
import { CTAButtonComponent } from '@aiaca/ui';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled' }),
    AppComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
    HomeComponent,
    HowItWorksComponent,
    PricingComponent,
    ResourcesComponent,
    ScanComponent,
    CTAButtonComponent,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideClientHydration()],
  bootstrap: [AppComponent],
})
export class AppModule {}
