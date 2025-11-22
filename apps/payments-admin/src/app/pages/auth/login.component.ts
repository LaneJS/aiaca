import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/state/notification.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  readonly form = signal({ email: '', password: '' });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    const { email, password } = this.form();
    if (!email || !password) {
      this.error.set('Email and password are required.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    this.auth
      .login({ email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Signed in successfully');
          const fromQuery = this.route.snapshot.queryParamMap.get('returnUrl');
          const nextUrl = fromQuery || this.auth.consumeRedirect() || '/';
          this.router.navigateByUrl(nextUrl);
        },
        error: (err) => {
          const message = err?.error?.message || 'Unable to sign in. Check your credentials.';
          this.error.set(message);
          this.notifications.error(message);
        },
      });
  }

  updateField(field: 'email' | 'password', value: string): void {
    this.form.update((current) => ({ ...current, [field]: value }));
  }
}
