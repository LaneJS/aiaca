import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

type AuthMode = 'login' | 'reset-request' | 'reset-confirm';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  mode: AuthMode = 'login';
  isLoading = false;
  errorMessage = '';
  lockoutMessage = '';
  successMessage = '';
  sessionNotice = '';
  redirectPath: string | null = null;
  signupUrl = `${environment.marketingSiteUrl}/signup`;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', []],
    confirmPassword: ['', []],
    resetToken: ['', []],
  });

  constructor() {
    this.configureValidators(this.mode);
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const reason = params.get('reason');
    const redirectTo = params.get('redirectTo');
    const resetToken = params.get('token');
    const modeParam = params.get('mode') as AuthMode | null;

    if (redirectTo && redirectTo.startsWith('/')) {
      this.redirectPath = redirectTo;
    }

    if (resetToken) {
      this.form.patchValue({ resetToken });
    }

    if (reason) {
      this.sessionNotice = this.mapReasonToMessage(reason);
    }

    if (modeParam) {
      this.setMode(modeParam, false);
    } else if (resetToken) {
      this.setMode('reset-confirm', false);
    }
  }

  setMode(mode: AuthMode, resetForm = true): void {
    this.mode = mode;
    this.errorMessage = '';
    this.lockoutMessage = '';
    this.successMessage = '';

    this.configureValidators(mode);

    if (resetForm) {
      const email = this.form.controls.email.value;
      this.form.reset({
        email: mode === 'reset-request' ? email : '',
        password: '',
        confirmPassword: '',
        resetToken: mode === 'reset-confirm' ? this.route.snapshot.queryParamMap.get('token') ?? '' : '',
      });
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.lockoutMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.mode === 'reset-confirm' && this.passwordsDoNotMatch()) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    const { email, password, resetToken } = this.form.getRawValue();

    let action: Observable<void>;
    if (this.mode === 'login') {
      action = this.auth.login(email, password).pipe(map(() => void 0));
    } else if (this.mode === 'reset-request') {
      action = this.auth.requestPasswordReset(email);
    } else {
      action = this.auth.confirmPasswordReset((resetToken || '').trim(), password);
    }

    action.subscribe({
      next: () => {
        this.isLoading = false;
        if (this.mode === 'reset-request') {
          this.successMessage = 'If your email is registered, we sent a reset link. Please check your inbox.';
          this.toasts.push(this.successMessage, 'info');
          return;
        }
        if (this.mode === 'reset-confirm') {
          this.successMessage = 'Password updated. You can now sign in.';
          this.toasts.push(this.successMessage, 'success');
          this.setMode('login');
          return;
        }
        this.toasts.push('Successfully logged in', 'success');
        this.router.navigateByUrl(this.redirectPath || '/overview');
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        if (this.isLockout(error)) {
          this.lockoutMessage = 'Too many attempts. Please wait a moment before trying again.';
        }
        this.toasts.push(this.errorMessage, 'error');
      },
    });
  }

  private configureValidators(mode: AuthMode): void {
    const { email, password, confirmPassword, resetToken } = this.form.controls;

    email.setValidators(
      mode === 'login' || mode === 'reset-request'
        ? [Validators.required, Validators.email]
        : [Validators.email],
    );
    password.setValidators(
      mode === 'login' || mode === 'reset-confirm' ? [Validators.required, Validators.minLength(6)] : [],
    );
    confirmPassword.setValidators(mode === 'reset-confirm' ? [Validators.required] : []);
    resetToken.setValidators(mode === 'reset-confirm' ? [Validators.required] : []);

    [email, password, confirmPassword, resetToken].forEach((control) => control.updateValueAndValidity({ emitEvent: false }));
  }

  private passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    return password !== confirmPassword;
  }

  private mapReasonToMessage(reason: string): string {
    if (reason === 'expired') {
      return 'Your session expired. Please sign in again.';
    }
    if (reason === 'manual') {
      return 'You have signed out. Sign back in to continue.';
    }
    if (reason === 'unauthorized' || reason === 'unauthenticated') {
      return 'Please sign in to continue.';
    }
    return '';
  }

  private isLockout(error: HttpErrorResponse): boolean {
    const apiCode = typeof error.error === 'object' ? error.error?.code : null;
    const apiMessage = typeof error.error === 'object' ? (error.error?.message as string | undefined) : undefined;
    const normalizedMessage = apiMessage?.toLowerCase() ?? '';
    return error.status === 429 || apiCode === 'rate_limited' || normalizedMessage.includes('lock');
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiMessage = typeof error.error === 'object' ? (error.error?.message as string | undefined) : undefined;
    const apiCode = typeof error.error === 'object' ? (error.error?.code as string | undefined) : undefined;

    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection and try again.';
    }
    if (error.status === 429 || apiCode === 'rate_limited') {
      return 'Too many attempts. Please try again in a moment.';
    }
    if (error.status === 404 && (this.mode === 'reset-request' || this.mode === 'reset-confirm')) {
      return 'Password reset is not enabled yet. Contact support to regain access.';
    }
    if (error.status === 423 || (apiMessage && apiMessage.toLowerCase().includes('locked'))) {
      return 'Your account is temporarily locked. Please reset your password or try again later.';
    }
    if (error.status === 401) {
      return this.mode === 'login' ? 'Invalid email or password' : 'Session expired. Please sign in again.';
    }
    if (error.status === 409) {
      return apiMessage || 'An account with this email already exists';
    }
    if (error.status === 400 && apiMessage) {
      return apiMessage;
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return apiMessage || 'An unexpected error occurred. Please try again.';
  }
}
