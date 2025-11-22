import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  authStorageKey: string;
  stripePublishableKey?: string;
  environmentName?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  factory: () => ({
    apiBaseUrl: '/api/v1',
    authStorageKey: 'payments-admin.auth',
    stripePublishableKey: '',
    environmentName: 'staging',
  }),
});
