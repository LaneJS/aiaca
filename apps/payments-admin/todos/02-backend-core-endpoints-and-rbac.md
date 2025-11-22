Backend/API Agent — Core billing endpoints + RBAC
Goal: Deliver secure REST APIs (v1) for all core billing operations with RBAC and idempotency enforced.
Scope:
- Implement endpoints for accounts/contacts (CRUD, payment method attach/detach references, notes/tags, tax IDs/addresses), plans/prices (CRUD, activate/deactivate, add-ons, coupons, scheduled changes), subscriptions (create/swap/cancel/pause/resume, proration/seats/trials), invoices/charges (list/retrieve, create one-off invoice, retry, mark offline payment, issue credit note/refund).
- Apply RBAC middleware and per-endpoint scope checks (viewer/operator/admin). Return redacted fields for restricted roles; block writes without proper role.
- Use DTOs from packages/domain; validate payloads; support pagination/filtering/sorting for all table views used by frontend.
- Enforce idempotency keys on all create/update calls (persist + reject duplicates); consistent error codes/messages for frontend toasts.
- Wire to Stripe client for server-side actions where applicable; store reconciliation info from Stripe responses.
Dependencies: Schema/DTOs from 01. Coordinate routes and field names with frontend agent before merging to avoid contract drift.
