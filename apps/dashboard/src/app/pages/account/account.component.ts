import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Plan, Price, Subscription } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected plans: Plan[] = [];
  protected prices: Record<string, Price[]> = {};
  protected subscriptions: Subscription[] = [];
  protected isLoading = true;
  protected error: string | null = null;
  protected selectedPlanId: string | null = null;
  protected selectedPriceId: string | null = null;
  protected billingRequired = false;
  protected isReactivating = false;
  protected subscriptionStatus: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.billingRequired = params['billing'] === 'required';
    });
    this.loadBilling();
    this.loadSubscriptionStatus();
  }

  loadBilling(): void {
    this.isLoading = true;
    this.error = null;
    this.api.listPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        if (plans.length) {
          this.selectedPlanId = plans[0].id;
          this.loadPrices(plans[0].id);
        }
        this.loadSubscriptions();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.friendlyError(err, 'Unable to load plans.');
        this.isLoading = false;
      }
    });
  }

  loadPrices(planId: string): void {
    this.api.listPrices(planId).subscribe({
      next: (prices) => {
        this.prices[planId] = prices;
        if (!this.selectedPriceId && prices.length) {
          this.selectedPriceId = prices[0].id;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.friendlyError(err, 'Unable to load plan prices.');
      }
    });
  }

  private loadSubscriptions(): void {
    this.api.listSubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions = subs;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.friendlyError(err, 'Unable to load subscriptions.');
        this.isLoading = false;
      }
    });
  }

  private loadSubscriptionStatus(): void {
    this.api.getSubscriptionStatus().subscribe({
      next: (response) => {
        this.subscriptionStatus = response.status;
      },
      error: (err: HttpErrorResponse) => {
        // Ignore errors for subscription status (402 might be expected)
        console.warn('Could not load subscription status:', err);
      }
    });
  }

  reactivateSubscription(): void {
    this.isReactivating = true;
    this.error = null;
    this.api.createCheckoutSession().subscribe({
      next: (response) => {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.friendlyError(err, 'Unable to start checkout session.');
        this.isReactivating = false;
      }
    });
  }

  openBillingPortal(): void {
    this.isReactivating = true;
    this.error = null;
    this.api.createBillingPortalSession().subscribe({
      next: (response) => {
        // Redirect to Stripe billing portal
        window.location.href = response.portalUrl;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.friendlyError(err, 'Unable to open billing portal.');
        this.isReactivating = false;
      }
    });
  }

  get hasActiveSubscription(): boolean {
    const status = this.auth.user()?.subscriptionStatus || this.subscriptionStatus;
    return status === 'ACTIVE' || status === 'TRIALING';
  }

  get displaySubscriptionStatus(): string {
    const status = this.auth.user()?.subscriptionStatus || this.subscriptionStatus;
    if (!status || status === 'NONE') return 'No active subscription';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  private friendlyError(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) return 'Network error. Please try again.';
    if (err.status === 404 || err.status === 501) return 'Billing is not enabled in this environment.';
    return err.error?.message || fallback;
  }
}
