import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  mode: 'login' | 'signup' = 'login';
  form = this.fb.nonNullable.group({
    name: ['', []],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    const action = this.mode === 'login' ? this.auth.login(email, password) : this.auth.signup(name, email, password);
    action.subscribe({
      next: () => {
        this.toasts.push('Authenticated', 'success');
        this.router.navigate(['/overview']);
      },
      error: () => {
        this.toasts.push('Using demo login for now', 'info');
        this.auth.ensureDemoSession();
        this.router.navigate(['/overview']);
      },
    });
  }
}
