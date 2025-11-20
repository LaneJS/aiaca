import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingDataService } from '../../services/billing-data.service';
import { AccountRecord, BillingPlan } from '../../types';

interface PlanView extends BillingPlan {
  monthlyRevenue: number;
  seatsInUse: number;
}

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent {
  private readonly billing = inject(BillingDataService);
  readonly plans$: Observable<PlanView[]> = combineLatest([
    this.billing.plans$,
    this.billing.accounts$,
  ]).pipe(
    map(([plans, accounts]) =>
      plans.map((plan) => ({
        ...plan,
        monthlyRevenue: plan.price * plan.activeSubscribers,
        seatsInUse: this.seatsForPlan(plan.name, accounts),
      }))
    )
  );

  readonly accounts$: Observable<AccountRecord[]> = this.billing.accounts$;

  newPlan: Partial<BillingPlan> = {
    name: '',
    price: 0,
    cadence: 'monthly',
    seatsIncluded: 1,
    features: [],
  };

  addPlan(): void {
    if (!this.newPlan.name || !this.newPlan.price) {
      return;
    }

    const features = Array.isArray(this.newPlan.features)
      ? this.newPlan.features
      : (this.newPlan.features ?? '')
          .toString()
          .split(',')
          .map((feature) => feature.trim())
          .filter(Boolean);

    this.billing.addPlan({
      name: this.newPlan.name,
      price: Number(this.newPlan.price),
      cadence: (this.newPlan.cadence as 'monthly' | 'yearly') ?? 'monthly',
      seatsIncluded: Number(this.newPlan.seatsIncluded) || 1,
      features,
    });

    this.newPlan = {
      name: '',
      price: 0,
      cadence: 'monthly',
      seatsIncluded: 1,
      features: [],
    };
  }

  private seatsForPlan(planName: string, accounts: AccountRecord[]): number {
    return accounts
      .filter((acct) => acct.plan === planName && acct.status !== 'cancelled')
      .reduce((total, acct) => total + acct.seats, 0);
  }
}
