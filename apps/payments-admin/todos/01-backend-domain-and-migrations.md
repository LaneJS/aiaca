Backend/API Agent — Establish billing domain + persistence foundations
Goal: Model all billing objects and persistence so API and frontend can rely on real data (no mocks).
Scope:
- Define entities/value objects for: User, Role, Account, Contact, PaymentMethod (Stripe refs only), Plan, Price, Subscription, SubscriptionItem, Invoice, InvoiceLine, Charge, Refund, Dispute, CreditNote, Adjustment, Coupon, AuditLog, WebhookEvent, DunningSchedule, DunningEvent, ReconciliationDrift, IdempotencyRequest.
- Add migrations in services/api (and shared DDL if needed) covering tables, FKs, indexes for reporting/filtering (account_id, status, currency, created_at), soft deletes/history where required, and append-only audit log.
- Ensure Stripe mirrors: store Stripe IDs for customers/subscriptions/invoices/charges/payment_methods, amounts in minor units, currency codes, tax fields, fees, metadata blob, webhook signature storage.
- Create/extend DTOs + validation in packages/domain for these objects with pagination and sorting primitives used by tables.
- Add idempotency + request UUID storage per account, plus webhook delivery log table with signature + timestamps.
Dependencies: Align naming/fields with payments-admin frontend needs and AGENTS.md security baseline (no PAN/CVC storage). No endpoints yet; focus on schema/DTO parity.
