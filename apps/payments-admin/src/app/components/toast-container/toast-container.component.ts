import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService, ToastLevel } from '../../core/state/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent {
  private readonly notifications = inject(NotificationService);
  readonly toasts = this.notifications.toasts;

  dismiss(id: string): void {
    this.notifications.dismiss(id);
  }

  badgeClass(level: ToastLevel): string {
    switch (level) {
      case 'success':
        return 'toast--success';
      case 'warning':
        return 'toast--warning';
      case 'error':
        return 'toast--error';
      default:
        return 'toast--info';
    }
  }
}
