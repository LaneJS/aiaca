# AGENTS.md – Payments Admin Portal (apps/payments-admin)

**Scope:** All files under `apps/payments-admin/**` (frontend) plus related contracts/tasks in `services/api/**` that power this portal.

## Purpose & Vision
The payments admin portal is the **internal control center** for billing, revenue operations, and customer payment oversight. It must:
- Give revenue ops full visibility into **accounts, subscriptions, invoices, payments, refunds, and disputes**.
- Support **cash collection and dunning** with Stripe as the PSP (Cards + ACH) while preserving auditability.
- Provide **read/write controls** for plan changes, credits, one-off charges, and user entitlements.
- Offer **exportable audit trails** for finance, tax, and compliance reviews.

## Core Capabilities (target state)
- **Accounts & contacts:** CRUD for accounts, billing contacts, tax IDs, addresses, and payment methods on file.
- **Subscriptions & plans:** Create/swap/cancel plans, proration, seat adjustments, coupons/discounts, scheduled changes, and add-ons.
- **Invoicing & payments:** Generate invoices, capture payments, retry failed charges, mark offline payments, partial payments, and refunds.
- **Dunning & collections:** Automated retries, past-due queues, reminder templates, write-offs, and notes on collection attempts.
- **Disputes:** View chargebacks, upload evidence packet references, track dispute statuses, and deadlines.
- **Payout & tax visibility:** Fees, net vs. gross, sales-tax/VAT fields, and exportable settlement summaries.
- **Auditing:** Immutable audit log of user actions (who/when/what), data changes, webhook deliveries, and settlement confirmations.
- **Reporting:** MRR/ARR, churn, cohort of failed payments, top debtors, plan mix, and invoice aging views with CSV export.
- **User access & safety:** RBAC (viewer/operator/admin), impersonation safeguards, field-level redaction for PANs, and least-privilege defaults.

## Agents & Ownership
- **Product & Ops Agent:** Owns workflows (collections, refunds, disputes), defines SLAs, and prioritizes backlog for revenue ops.
- **UX & Content Agent:** Crafts table layouts, filters, bulk actions, and clear billing language; ensures accessibility and printable outputs.
- **Frontend Agent (Angular):** Implements routes, data fetching, optimistic updates with rollback, and state for selections/filters; wires to API without mock data.
- **Backend/API Agent (Spring Boot):** Adds DTOs/entities (Accounts, Users, PaymentMethods, Plans, Subscriptions, Invoices, Charges, Refunds, Disputes, AuditLog) and exposes secured REST/webhook handlers; enforces idempotency and validation.
- **Data & Persistence Agent:** Designs migrations for billing tables, reference data (currencies, tax rates), soft deletes, and history tables; ensures indexes for reporting queries.
- **DevOps & Observability Agent:** Manages Stripe keys/secrets, webhook signing, background workers, logging/metrics for payment events, and alerting on failures.
- **QA & Compliance Agent:** Defines acceptance tests (happy path + dunning + dispute), validates PCI scope boundaries, and keeps axe/Playwright coverage current.

## Information Architecture (frontend)
- **Dashboard:** KPIs (MRR, net revenue, failed payments, dispute counts), aging widgets, and at-risk accounts list.
- **Accounts:** Search/filter, account detail with contacts, payment methods, subscription history, invoices, and audit log tab.
- **Payments:** Invoice list, payment attempts, retries, refunds, dispute indicators, and bulk actions for reminders.
- **Plans & Pricing:** Plan catalog, add-ons, coupons, scheduled changes, and price book governance.
- **Operations Center:** Dunning queue, dispute queue, webhook delivery monitor, exports/download center.
- **Settings:** Roles & access, email templates, Stripe configuration status, tax settings, and data retention controls.

## Stripe & API Integration Expectations
- Use **Stripe customer + subscription + invoice/charge** primitives; mirror IDs in our DB for reconciliation.
- **Webhooks:** `invoice.payment_succeeded/failed`, `customer.subscription.updated`, `charge.refunded`, `charge.dispute.*`, `payment_method.*` captured with signature verification and idempotency keys stored server-side.
- **Idempotency & retries:** All create/update actions use idempotency keys from the frontend; backend must persist request UUIDs per account to avoid duplicate charges.
- **Data sync:** Nightly backfill job to reconcile invoices/charges and mark drift; dashboard surfaces mismatches for manual review.
- **PII/PCI:** Never store full card numbers or CVC; store Stripe PaymentMethod references, last4, brand, exp month/year only; redact logs.

## TODO – Frontend (apps/payments-admin)
- Replace **mock BillingDataService** with API-backed services and typed DTOs from `@aiaca/domain`.
- Implement **auth** (SSO-ready) with role-based guards; show redacted fields for read-only roles.
- Build **accounts detail** page: contacts, payment methods, subscription timeline, invoice history, dunning notes, audit log, and activity feed.
- Add **payments/invoices views**: sorting/filtering, status chips, retry/refund/mark-offline actions with confirmation dialogs.
- Create **plan management UI**: plan catalog editor, price overrides, coupons, and scheduled changes UI with validation.
- Add **operations center**: past-due queue with bulk reminder templates, dispute tracker with deadlines, webhook delivery status.
- Provide **reporting dashboards**: MRR/ARR, cash vs. refunds, invoice aging buckets, churn/retention charts, export buttons.
- Implement **form validations & accessibility** (ARIA labels, focus management, table keyboard nav, toast feedback on async actions).
- Add **audit log surfaces** (per entity + global) with filters and CSV export.
- Integrate **Stripe Elements** or Checkout for one-off charges and payment method updates; handle 3DS flows and error states.
- Provide **settings pages**: role management, email templates, tax settings, webhook status, environment indicators.

## TODO – Backend/API (services/api)
- Add **entities + migrations**: User, Role, Account, Contact, PaymentMethod (tokenized refs), Plan, Price, Subscription, SubscriptionItem, Invoice, InvoiceLine, Charge, Refund, Dispute, CreditNote, Adjustment, Coupon, AuditLog, WebhookEvent, DunningSchedule, DunningEvent.
- Add **DTOs + mappers** in `packages/domain` for all billing objects; ensure validation and pagination contracts for tables.
- Implement **REST endpoints** (v1):
  - Accounts: CRUD, attach payment method, notes, tags, upload tax IDs/addresses.
  - Plans/Prices: CRUD, activate/deactivate, add-ons, coupons, scheduled changes.
  - Subscriptions: create/swap/cancel/pause/resume, proration options, seat changes, trial extensions.
  - Invoices & payments: list, retrieve, create one-off invoice, retry, mark offline payment, issue credit note/refund.
  - Dunning: list queues, send reminder, log touchpoints, mark promise-to-pay, write-offs.
  - Disputes: list, add evidence references, mark submitted/accepted/lost.
  - Audit logs: query by entity/user/date; export endpoint (CSV/JSON).
  - Webhook monitor: delivery attempts, replay, signature verification status.
- **Stripe integration:** client for server-side calls (customers, payment methods, invoices, subscriptions, refunds, disputes); store Stripe IDs; enforce idempotency keys.
- **Jobs/workers:** dunning retries, nightly reconciliation, webhook retry dead-letter queue, invoice aging rollups, report materializations.
- **Security:** RBAC middleware, scope checks per endpoint, tamper-proof audit logging (append-only), rate limits, request tracing.
- **Testing:** unit + integration tests with Stripe mock client, contract tests for DTOs, seed scripts for demo/stage data.

## Deployment & Compliance Notes
- Configure secrets for Stripe (publishable/secret keys, webhook signing secret) via env/secret manager; never commit keys.
- Enable structured logging for all payment events and webhook deliveries; ship to centralized logging.
- Metrics/alerts: payment success rate, retry success, dispute win rate, webhook failure count, reconciliation drift.
- Data retention: purge PII on account deletion; keep financial records per tax policy; document retention windows in `docs/security-privacy.md`.
- Release readiness checklist: lint/tests, accessibility sweeps, load test critical endpoints, and verify database migrations on staging before prod cutover.
