import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../config/app-config';

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripeInstance: any | null = null;
  private stripeLoading = false;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async loadStripe(publishableKey?: string): Promise<any | null> {
    const key = publishableKey || this.config.stripePublishableKey;
    if (!key) {
      throw new Error('Stripe publishable key not configured');
    }

    if (this.stripeInstance) {
      return this.stripeInstance;
    }

    if (!window.Stripe) {
      if (this.stripeLoading) {
        return this.waitForStripe();
      }
      this.stripeLoading = true;
      await this.injectScript();
    }

    if (!window.Stripe) {
      throw new Error('Stripe.js failed to load');
    }

    this.stripeInstance = window.Stripe(key);
    return this.stripeInstance;
  }

  private injectScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.body.appendChild(script);
    });
  }

  private waitForStripe(): Promise<void> {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.Stripe) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(() => reject(new Error('Stripe.js timed out')), 5000);
      check();
    });
  }
}
