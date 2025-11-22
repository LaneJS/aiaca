import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  Coupon,
  CouponDuration,
  Plan,
  PlanStatus,
  Price,
  PriceInterval,
  Subscription,
  UsageType,
} from '@aiaca/domain';
import { BillingApiService } from '../../core/api/billing-api.service';
import { NotificationService } from '../../core/state/notification.service';
import { LoadingService } from '../../core/state/loading.service';

interface PlanView {
  plan: Plan;
  prices: Price[];
  subscriptions: number;
}

type PlanFormState = {
  code: string;
  name: string;
  description: string;
  status: PlanStatus;
};

type PriceFormState = {
  planId: string;
  amount: number;
  currency: string;
  interval: PriceInterval;
  intervalCount: number;
  usageType: UsageType;
  active: boolean;
};

type CouponFormState = {
  code: string;
  percentOff: number;
  amountOff: number;
  duration: CouponDuration;
  durationInMonths: number;
  maxRedemptions: number | undefined;
};

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent {
  private readonly api = inject(BillingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly loading = inject(LoadingService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly plans$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listPlans({ page: 0, pageSize: 50 }))
        .pipe(
          switchMap((res) => {
            if (!res.items.length) {
              return of([] as Plan[]);
            }
            return of(res.items);
          }),
          catchError(() => {
            this.notifications.error('Unable to load plans');
            return of([] as Plan[]);
          })
        )
    ),
    shareReplay(1)
  );

  readonly prices$ = this.plans$.pipe(
    switchMap((plans) => {
      if (!plans.length) {
        return of([] as Price[]);
      }
      const requests = plans.map((plan) => this.api.listPrices(plan.id));
      return forkJoin(requests).pipe(map((priceLists) => priceLists.flat()));
    }),
    catchError(() => of([] as Price[])),
    shareReplay(1)
  );

  readonly subscriptions$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listSubscriptions({ page: 0, pageSize: 200 }))
        .pipe(
          map((res) => res.items),
          catchError(() => {
            this.notifications.error('Unable to load subscriptions');
            return of([] as Subscription[]);
          })
        )
    ),
    shareReplay(1)
  );

  readonly planViews$ = combineLatest([this.plans$, this.prices$, this.subscriptions$]).pipe(
    map(([plans, prices, subs]) => {
      const priceToPlan = new Map<string, string>();
      prices.forEach((price) => priceToPlan.set(price.id, price.planId));

      const planUsage = new Map<string, number>();
      subs.forEach((sub) => {
        const items = (sub as any).items ?? [];
        items.forEach((item: any) => {
          const planId = priceToPlan.get(item.priceId);
          if (planId) {
            planUsage.set(planId, (planUsage.get(planId) || 0) + 1);
          }
        });
      });

      return plans.map<PlanView>((plan) => ({
        plan,
        prices: prices.filter((p) => p.planId === plan.id),
        subscriptions: planUsage.get(plan.id) || 0,
      }));
    })
  );

  readonly coupons$ = this.refresh$.pipe(
    switchMap(() =>
      this.loading
        .track(this.api.listCoupons({ page: 0, pageSize: 50 }))
        .pipe(
          catchError(() => {
            this.notifications.error('Unable to load coupons');
            return of({ items: [] as Coupon[], total: 0, page: 0, pageSize: 50 });
          })
        )
    ),
    shareReplay(1)
  );

  readonly newPlan = signal<PlanFormState>({
    code: '',
    name: '',
    description: '',
    status: PlanStatus.ACTIVE,
  });

  readonly newPrice = signal<PriceFormState>({
    planId: '',
    amount: 0,
    currency: 'USD',
    interval: PriceInterval.MONTHLY,
    intervalCount: 1,
    usageType: UsageType.LICENSED,
    active: true,
  });

  readonly newCoupon = signal<CouponFormState>({
    code: '',
    percentOff: 0,
    amountOff: 0,
    duration: CouponDuration.FOREVER,
    durationInMonths: 3,
    maxRedemptions: undefined,
  });

  readonly PlanStatus = PlanStatus;
  readonly PriceInterval = PriceInterval;
  readonly UsageType = UsageType;
  readonly CouponDuration = CouponDuration;
  readonly planActionLoading = signal<Set<string>>(new Set());

  createPlan(): void {
    const payload = this.newPlan();
    if (!payload.code || !payload.name) {
      this.notifications.warning('Code and name are required');
      return;
    }

    this.loading.track(this.api.createPlan(payload)).subscribe({
      next: () => {
        this.notifications.success('Plan created');
        this.resetPlanForm();
        this.reload();
      },
      error: () => this.notifications.error('Unable to create plan'),
    });
  }

  addPrice(): void {
    const price = this.newPrice();
    if (!price.planId || !price.amount) {
      this.notifications.warning('Plan and amount are required');
      return;
    }

    this.loading
      .track(
        this.api.addPrice(price.planId, {
          amount: Math.round(price.amount * 100),
          currency: price.currency,
          interval: price.interval,
          intervalCount: price.intervalCount,
          usageType: price.usageType,
          active: price.active,
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Price added');
          this.resetPriceForm();
          this.reload();
        },
        error: () => this.notifications.error('Unable to add price'),
      });
  }

  createCoupon(): void {
    const coupon = this.newCoupon();
    if (!coupon.code) {
      this.notifications.warning('Coupon code is required');
      return;
    }
    if (!coupon.percentOff && !coupon.amountOff) {
      this.notifications.warning('Provide percent off or amount off');
      return;
    }

    this.loading
      .track(
        this.api.createCoupon({
          code: coupon.code,
          percentOff: coupon.percentOff || undefined,
          amountOff: coupon.amountOff ? Math.round(coupon.amountOff * 100) : undefined,
          duration: coupon.duration,
          durationInMonths: coupon.duration === CouponDuration.REPEATING ? coupon.durationInMonths : undefined,
          maxRedemptions: coupon.maxRedemptions,
          valid: true,
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Coupon created');
          this.newCoupon.set({
            code: '',
            percentOff: 0,
            amountOff: 0,
            duration: CouponDuration.FOREVER,
            durationInMonths: 3,
            maxRedemptions: undefined,
          });
          this.reload();
        },
        error: () => this.notifications.error('Unable to create coupon'),
      });
  }

  setCouponCode(value: string): void {
    this.patchCoupon({ code: value });
  }

  setCouponPercent(value: string | number | null): void {
    const numeric = value === null || value === '' ? 0 : Number(value);
    this.patchCoupon({ percentOff: Number.isFinite(numeric) ? (numeric as number) : 0 });
  }

  setCouponAmount(value: string | number | null): void {
    const numeric = value === null || value === '' ? 0 : Number(value);
    this.patchCoupon({ amountOff: Number.isFinite(numeric) ? (numeric as number) : 0 });
  }

  setCouponDuration(value: CouponDuration | string): void {
    this.patchCoupon({ duration: value as CouponDuration });
  }

  updateCouponMaxRedemptions(value: string | number | null): void {
    const parsed = value === null || value === '' ? undefined : Number(value);
    const numeric = typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
    this.newCoupon.update((curr) => ({ ...curr, maxRedemptions: numeric }));
  }

  setPlanCode(value: string): void {
    this.patchPlan({ code: value });
  }

  setPlanName(value: string): void {
    this.patchPlan({ name: value });
  }

  setPlanDescription(value: string): void {
    this.patchPlan({ description: value });
  }

  setPlanStatus(value: PlanStatus | string): void {
    this.patchPlan({ status: value as PlanStatus });
  }

  setPricePlan(value: string): void {
    this.patchPrice({ planId: value });
  }

  setPriceAmount(value: string | number | null): void {
    const numeric = value === null || value === '' ? 0 : Number(value);
    this.patchPrice({ amount: Number.isFinite(numeric) ? (numeric as number) : 0 });
  }

  setPriceCurrency(value: string): void {
    this.patchPrice({ currency: value });
  }

  setPriceInterval(value: PriceInterval | string): void {
    this.patchPrice({ interval: value as PriceInterval });
  }

  setPriceIntervalCount(value: string | number | null): void {
    const numeric = value === null || value === '' ? 1 : Number(value);
    this.patchPrice({ intervalCount: Number.isFinite(numeric) ? (numeric as number) : 1 });
  }

  setPriceUsage(value: UsageType | string): void {
    this.patchPrice({ usageType: value as UsageType });
  }

  setPriceActive(value: boolean | string): void {
    const asBool = typeof value === 'string' ? value === 'true' || value === 'on' : !!value;
    this.patchPrice({ active: asBool });
  }

  togglePlanStatus(plan: Plan, status: PlanStatus): void {
    if (plan.status === status) {
      return;
    }
    if (!window.confirm(`Update plan ${plan.name} to ${status}?`)) {
      return;
    }
    this.planActionLoading.update((set) => new Set(set).add(plan.id));
    this.loading
      .track(
        this.api.updatePlan(plan.id, {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          status,
        })
      )
      .pipe(
        finalize(() =>
          this.planActionLoading.update((set) => {
            const next = new Set(set);
            next.delete(plan.id);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.notifications.success('Plan status updated');
          this.reload();
        },
        error: () => this.notifications.error('Unable to update plan'),
      });
  }

  scheduledChangePlaceholder(plan: Plan): void {
    this.notifications.info(`Scheduled change placeholder for plan ${plan.name} (hook to backend when ready)`, undefined, 3500);
  }

  formatAmount(amount?: number, currency?: string): string {
    const value = amount ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(value / 100);
  }

  private reload(): void {
    this.refresh$.next();
  }

  private resetPlanForm(): void {
    this.newPlan.set({ code: '', name: '', description: '', status: PlanStatus.ACTIVE });
  }

  private resetPriceForm(): void {
    this.newPrice.set({
      planId: '',
      amount: 0,
      currency: 'USD',
      interval: PriceInterval.MONTHLY,
      intervalCount: 1,
      usageType: UsageType.LICENSED,
      active: true,
    });
  }

  private patchCoupon(update: Partial<CouponFormState>): void {
    this.newCoupon.update((curr) => ({ ...curr, ...update }));
  }

  private patchPlan(update: Partial<PlanFormState>): void {
    this.newPlan.update((curr) => ({ ...curr, ...update }));
  }

  private patchPrice(update: Partial<PriceFormState>): void {
    this.newPrice.update((curr) => ({ ...curr, ...update }));
  }
}
