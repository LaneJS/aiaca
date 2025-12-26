import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CTAButtonComponent } from '@aiaca/ui';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, FormsModule, CTAButtonComponent],
})
export class SignupComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false;
  submitting = false;
  errorMessage = '';
  validationErrors: { [key: string]: string } = {};

  private readonly authService = inject(AuthService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Sign up for accessibility monitoring',
      description: 'Create your account and start monitoring your website accessibility today.',
      path: '/signup',
    });
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Email validation
    if (!this.email.trim()) {
      this.validationErrors['email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.validationErrors['email'] = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!this.password) {
      this.validationErrors['password'] = 'Password is required';
      isValid = false;
    } else if (this.password.length < 8) {
      this.validationErrors['password'] = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!this.confirmPassword) {
      this.validationErrors['confirmPassword'] = 'Please confirm your password';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.validationErrors['confirmPassword'] = 'Passwords do not match';
      isValid = false;
    }

    if (!this.termsAccepted) {
      this.validationErrors['terms'] = 'You must accept the terms to continue';
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;

    this.authService.registerCheckout(this.email, this.password, this.name || undefined).subscribe({
      next: (response) => {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      },
      error: (error) => {
        this.submitting = false;

        // Handle specific error messages from backend
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 409) {
          this.errorMessage = 'An account with this email already exists. Please login instead.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid registration information. Please check your details and try again.';
        } else {
          this.errorMessage = 'We could not create your account. Please try again shortly.';
        }
      },
    });
  }
}
