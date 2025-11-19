import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button *ngIf="actionLabel" (click)="action.emit()" class="btn-primary">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      min-height: 300px;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #111827;
    }
    p {
      margin: 0 0 1.5rem 0;
      color: #6b7280;
      max-width: 400px;
    }
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📋';
  @Input() title = 'No items found';
  @Input() message = 'Get started by creating your first item.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
