import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  protected plans: Plan[] = [];
  protected prices: Record<string, Price[]> = {};
  protected subscriptions: Subscription[] = [];
  protected isLoading = true;
  protected error: string | null = null;
  protected selectedPlanId: string | null = null;
  protected selectedPriceId: string | null = null;

  ngOnInit(): void {
    this.loadBilling();
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

  private loadPrices(planId: string): void {
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

  private friendlyError(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) return 'Network error. Please try again.';
    if (err.status === 404 || err.status === 501) return 'Billing is not enabled in this environment.';
    return err.error?.message || fallback;
  }
}
