Frontend Handoff – Payments Admin

Scope: Kick off frontend todos 05–12 with real backend contracts (no mocks).

APIs & Contracts (implemented)
- Auth: existing JWT flow (`/api/v1/auth/**`). Roles come from user roles table (ROLE_USER default; toolbar can read `authorities`).
- Accounts: `/api/v1/billing/accounts`
  - GET list with filters: `status`, `currency`, `search`, `page`, `pageSize`.
  - GET `/accounts/{id}`.
  - Contacts: `/accounts/{id}/contacts` (GET, POST, PATCH, DELETE).
  - Payment methods: `/accounts/{id}/payment-methods` (GET, POST, PATCH, DELETE).
  - Requires `Idempotency-Key` header on mutating calls.
  - Responses map to DTOs in `@aiaca/domain` `billing.ts` (Account, Contact, PaymentMethod).
- Plans/Prices/Coupons:
  - `/api/v1/billing/plans` (GET list, POST create, PATCH update).
  - `/plans/{planId}/prices` (GET, POST).
  - `/api/v1/billing/coupons` (GET, POST).
- Subscriptions:
  - `/api/v1/billing/subscriptions` (GET filters: `accountId`, `status`).
  - POST create subscription (items array of priceId/quantity).
  - PATCH `/subscriptions/{id}/status` (payload: `{status, cancelAt?}`).
- Invoices:
  - `/api/v1/billing/invoices` (GET filters: `accountId`, `status`).
  - POST create invoice (lines with priceId/description/quantity/unitAmount/amount).
  - GET single invoice with lines.
- Payments:
  - Charges: `/api/v1/billing/payments/charges` (GET filters: `accountId`, `status`); POST create; PATCH status.
  - Refunds: POST `/charges/{chargeId}/refunds`.
  - Credit notes: POST `/invoices/{invoiceId}/credit-notes`.
- Dunning/Operations:
  - `/api/v1/billing/dunning/events` (GET) – list logged dunning events.
  - `/api/v1/billing/dunning/schedules` (GET) – list schedules.
  - `/api/v1/billing/dunning/queue` (GET) – past-due invoices queue (use for operations center).
  - `/api/v1/billing/dunning/events` POST – record manual event (requires Idempotency-Key).
- Disputes:
  - `/api/v1/billing/disputes` GET filters `status`; POST create with `chargeId`, `amount`, `currency` (basic stub); PATCH status.
- Webhooks monitor:
  - `/api/v1/billing/webhooks` GET filters `status`; PATCH `{id}/status`.
- Audit logs:
  - `/api/v1/billing/audit-logs` GET filters `accountId`, `entityType`.

Shared types
- `packages/domain/src/lib/billing.ts` exports enums + zod schemas for all DTOs (Accounts, Subscriptions, Invoices, Charges, Refunds, Disputes, CreditNotes, Dunning, WebhookEvent, IdempotencyRequest, etc.). Use these for typing API clients.

Headers & errors
- Auth: Bearer token.
- Idempotency: `Idempotency-Key` required on POST/PATCH/DELETE for billing resources.
- Error shape: `{ code, message, errors? }` from `GlobalExceptionHandler`.
- RBAC: Controllers guarded by roles (ADMIN/OPERATOR/VIEWER). Viewer should see redacted fields for sensitive actions (frontend enforce button disable).

Stripe
- Publishable key endpoint not yet added; Payment methods/3DS flow to be wired via backend when available. For now, backend expects only references (stripePaymentMethodId).

State/UX reminders
- Replace all mocks (BillingDataService, etc.) with real API calls using DTOs.
- Provide loading/empty/error states for tables and row-level actions.
- Announce changes (toasts, ARIA live).
- Use standalone components, inject(), provideRouter(), no NgModules.

Testing cues
- Backend test profile disables Flyway; expect H2 create-drop. Frontend E2E to hit live API when available; avoid mock fallbacks.

Next actions for frontend
1) Scaffold API client layer wrapping the endpoints above with DTO typing and idempotency header injection.
2) Implement auth guard + role-aware UI (Viewer vs Operator/Admin).
3) Begin with accounts list/detail (todo 06), then payments/invoices (07), plans (08), ops center (09), reporting/audit (10), Stripe Elements integration stub (11), settings/a11y polish (12).
