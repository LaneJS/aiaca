Frontend Agent — Plan catalog and pricing management
Goal: Enable creation/updates of plans, prices, coupons, and scheduled changes with validation.
Scope:
- Plan catalog UI: list plans/prices/add-ons, status toggles, currency handling, seat/unit pricing, free trials, metered flags.
- Editors: create/update plan/price with validation (proration, billing cycles, effective dates), coupon/discount management, add-on selection, scheduled changes preview.
- Display plan assignments per account and upcoming changes; allow cancel/pause/resume with confirmation.
- Leverage DTOs from @aiaca/domain; ensure consistency with backend rules; handle Stripe-linked fields read-only where appropriate.
- Accessibility + UX: inline validation, focus management on form errors, responsive layouts; avoid mock data.
Dependencies: Backend plan/price/subscription endpoints from 02; auth foundation from 05.
