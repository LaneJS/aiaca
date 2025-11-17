import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './core/auth.interceptor';
import { ShellComponent } from './layout/shell.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ScanDetailComponent } from './pages/scans/scan-detail.component';
import { ScansComponent } from './pages/scans/scans.component';
import { ScriptSetupComponent } from './pages/script-setup/script-setup.component';
import { SiteDetailComponent } from './pages/sites/site-detail.component';
import { SitesComponent } from './pages/sites/sites.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@NgModule({
  declarations: [
    App,
    ShellComponent,
    OverviewComponent,
    SitesComponent,
    SiteDetailComponent,
    ScansComponent,
    ScanDetailComponent,
    ScriptSetupComponent,
    AccountComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    ToastContainerComponent,
  ],
  providers: [provideBrowserGlobalErrorListeners(), { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [App],
})
export class AppModule {}
