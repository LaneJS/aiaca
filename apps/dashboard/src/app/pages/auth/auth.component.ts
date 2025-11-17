import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';
  form = this.fb.nonNullable.group({
    name: ['', []],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toasts: ToastService
  ) {}

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
