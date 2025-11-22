Backend/API Agent — Dunning, disputes, webhooks, and jobs
Goal: Implement payment lifecycle resilience: dunning flows, dispute handling, webhook processing, and background jobs.
Scope:
- Stripe webhooks: signature verification, idempotent processing, persist payload + delivery status, expose webhook monitor endpoints, replay capability for failed deliveries.
- Dunning: queue model + endpoints to list past-due invoices, trigger retries, send reminders (log template + channel), record touchpoints, promise-to-pay, write-offs, and update statuses accordingly.
- Disputes: list/filter disputes, store evidence packet references, endpoints to mark submitted/accepted/lost, deadlines surfaced, sync statuses from Stripe.
- Jobs/workers: scheduled retries for unpaid invoices, nightly reconciliation of Stripe objects vs DB (mark drift for UI), webhook retry DLQ, invoice aging rollups, report materialization hooks.
- Observability: structured logs + metrics around webhook successes/failures, retry outcomes, dispute win rate; trace ids propagated for frontend correlation.
Dependencies: 01–02 complete. Expose REST contracts needed for frontend operations center and monitoring views.
