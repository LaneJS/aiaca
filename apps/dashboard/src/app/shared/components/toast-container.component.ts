import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" role="status" aria-live="polite">
      <div *ngFor="let toast of toasts.messages()" class="toast" [attr.data-tone]="toast.tone">
        <span>{{ toast.message }}</span>
        <button type="button" (click)="toasts.dismiss(toast.id)" aria-label="Dismiss">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent {
  constructor(protected readonly toasts: ToastService) {}
}
