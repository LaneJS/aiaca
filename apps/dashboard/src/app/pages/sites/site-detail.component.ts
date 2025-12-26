import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { NotificationSettings, ScanSummary, SiteSchedule, SiteSummary } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { ToastService } from '../../core/toast.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SubscriptionStateService } from '../../core/subscription-state.service';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './site-detail.component.html',
  styleUrl: './site-detail.component.scss',
})
export class SiteDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toasts = inject(ToastService);
  protected readonly route = inject(ActivatedRoute);
  private readonly subscriptions = inject(SubscriptionStateService);

  protected site?: SiteSummary;
  protected scans: ScanSummary[] = [];
  protected isLoading = true;
  protected error: string | null = null;
  protected schedule?: SiteSchedule;
  protected scheduleLoading = true;
  protected scheduleError: string | null = null;
  protected scheduleUnavailable = false;
  protected scheduleSaving = false;
  protected scheduleForm: SiteSchedule = {
    cadence: 'weekly',
    timeUtc: '02:00',
    timezone: 'UTC',
    isActive: false,
  };
  protected notifications?: NotificationSettings;
  protected notificationsLoading = true;
  protected notificationsError: string | null = null;
  protected notificationsUnavailable = false;
  protected notificationsSaving = false;
  protected notificationsForm: NotificationSettings = {
    emailEnabled: false,
    digestCadence: 'weekly',
    slackWebhookUrl: '',
    webhookUrl: '',
  };

  ngOnInit(): void {
    this.subscriptions.refresh().subscribe();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load(id);
    } else {
      this.error = 'Site not found.';
      this.isLoading = false;
    }
  }

  load(id: string): void {
    this.isLoading = true;
    this.error = null;
    forkJoin({
      site: this.api.getSite(id),
      scans: this.api.listScans(id),
      schedule: this.api.getSiteSchedule(id).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404 || err.status === 501) {
            this.scheduleUnavailable = true;
          } else {
            this.scheduleError = 'Unable to load schedule right now.';
          }
          this.scheduleLoading = false;
          return of(null);
        })
      ),
      notifications: this.api.getSiteNotifications(id).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404 || err.status === 501) {
            this.notificationsUnavailable = true;
          } else {
            this.notificationsError = 'Unable to load notifications right now.';
          }
          this.notificationsLoading = false;
          return of(null);
        })
      )
    }).subscribe({
      next: ({ site, scans, schedule, notifications }) => {
        this.site = site;
        this.scans = scans;
        if (schedule) {
          this.schedule = schedule;
          this.scheduleForm = { ...schedule };
        }
        if (notifications) {
          this.notifications = notifications;
          this.notificationsForm = { ...notifications };
        }
        this.scheduleLoading = false;
        this.notificationsLoading = false;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load site details. Please try again.';
        this.isLoading = false;
        this.scheduleLoading = false;
        this.notificationsLoading = false;
      }
    });
  }

  copyEmbedKey(key?: string): void {
    if (!key) return;
    navigator.clipboard.writeText(key).then(
      () => this.toasts.push('Embed key copied', 'success'),
      () => this.toasts.push('Unable to copy embed key', 'error')
    );
  }

  saveSchedule(): void {
    if (this.isReadOnly) {
      this.toasts.push('Active subscription required to update schedules.', 'error');
      return;
    }
    if (!this.site || this.scheduleUnavailable) {
      this.toasts.push('Scheduling is not available in this environment.', 'info');
      return;
    }
    this.scheduleSaving = true;
    this.scheduleError = null;
    this.api.updateSiteSchedule(this.site.id, this.scheduleForm).subscribe({
      next: (schedule) => {
        this.schedule = schedule;
        this.scheduleForm = { ...schedule };
        this.scheduleSaving = false;
        this.scheduleUnavailable = false;
        this.toasts.push('Schedule saved', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.scheduleSaving = false;
        if (err.status === 404 || err.status === 501) {
          this.scheduleUnavailable = true;
          this.toasts.push('Scheduling not available yet. Please try again later.', 'info');
          return;
        }
        this.scheduleError = err.error?.message || 'Failed to save schedule. Please try again.';
      }
    });
  }

  saveNotifications(): void {
    if (this.isReadOnly) {
      this.toasts.push('Active subscription required to update notifications.', 'error');
      return;
    }
    if (!this.site || this.notificationsUnavailable) {
      this.toasts.push('Notifications are not available in this environment.', 'info');
      return;
    }
    this.notificationsSaving = true;
    this.notificationsError = null;
    this.api.updateSiteNotifications(this.site.id, this.notificationsForm).subscribe({
      next: (settings) => {
        this.notifications = settings;
        this.notificationsForm = { ...settings };
        this.notificationsSaving = false;
        this.notificationsUnavailable = false;
        this.toasts.push('Notification preferences saved', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.notificationsSaving = false;
        if (err.status === 404 || err.status === 501) {
          this.notificationsUnavailable = true;
          this.toasts.push('Notifications not available yet. Please try again later.', 'info');
          return;
        }
        this.notificationsError = err.error?.message || 'Failed to save notification settings.';
      }
    });
  }

  get isReadOnly(): boolean {
    return this.subscriptions.isReadOnly();
  }
}
