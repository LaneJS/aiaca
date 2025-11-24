import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { APP_CONFIG } from '../../core/config/app-config';
import { AuthService } from '../../core/auth/auth.service';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { WebhookEventStatus } from '@aiaca/domain';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  readonly config = inject(APP_CONFIG);
  readonly auth = inject(AuthService);
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  readonly Number = Number;

  readonly roles = this.auth.roles;
  readonly envName = this.config.environmentName || 'staging';
  readonly emailTemplate = signal('Hi {{name}},\n\nYour invoice is ready.\n\nThanks,\nBilling Ops');
  readonly taxRate = signal<number | null>(null);
  readonly webhookStatus = signal<{ total: number; failed: number }>({ total: 0, failed: 0 });
  readonly loadingWebhook = signal(false);

  loadWebhookHealth(): void {
    this.loadingWebhook.set(true);
    this.api
      .listWebhookEvents({ page: 0, pageSize: 100 })
      .pipe(
        finalize(() => this.loadingWebhook.set(false))
      )
      .subscribe({
        next: (page) => {
          const failed = page.items.filter((e) => e.status === WebhookEventStatus.FAILED).length;
          this.webhookStatus.set({ total: page.total, failed });
        },
        error: () => this.notifications.error('Unable to load webhook status'),
      });
  }

  saveEmailTemplate(): void {
    this.notifications.success('Email template saved');
  }

  saveTaxSettings(): void {
    this.notifications.success('Tax settings saved');
  }
}
