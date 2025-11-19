import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button *ngIf="showRetry" (click)="retry.emit()" class="btn-primary">
        Try Again
      </button>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      min-height: 300px;
    }
    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #dc2626;
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
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We encountered an error loading this content. Please try again.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
