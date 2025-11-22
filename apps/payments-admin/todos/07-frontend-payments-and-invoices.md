Frontend Agent — Payments and invoices workflows
Goal: Provide payments/invoices views with actionable controls tied to live API.
Scope:
- Payments/invoices tables: sorting/filtering (status, amount, date, account), status chips/badges, pagination.
- Actions: retry payment, refund/credit note issuance, mark offline payment, record partial payments; confirm dialogs with explicit impact summary; track retries with idempotency keys from backend.
- Display payment attempts, error messages from backend/Stripe, and dispute indicators; show timeline/history per invoice/charge.
- Implement optimistic UI with rollback on API failure; disable actions based on role guard; show loading states on row-level actions.
- Maintain accessibility: announce status changes, focus return after dialogs, keyboard-friendly menus.
Dependencies: 05 foundation; backend endpoints + idempotency from 02–03.
