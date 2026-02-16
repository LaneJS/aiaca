# AGENTS.md – Payments Admin (apps/payments-admin)

## Scope & Mission
- **Scope:** Only files in `apps/payments-admin/**`.
- **Platform context:** This app is part of **AACA (AI Accessibility Compliance Assistant)**.
- **Mission:** Deliver the internal billing/revenue operations UI used by AACA staff (not customer self-serve checkout), with production-grade auth, RBAC, auditability, and reliable API integration.

## Current State (Grounded in Repo)
- Angular app already uses standalone bootstrap (`bootstrapApplication`) with `provideRouter`.
- Core routes/pages exist for: Dashboard, Accounts, Account Detail, Payments, Plans, Operations, Reporting, Settings, and Auth.
- API client layer exists:
  - Frontend calls `services/api` via `/api/v1/**` base path.
  - Billing calls are routed through `/api/v1/billing/**`.
  - DTOs/types are already consumed from `@aiaca/domain` (`packages/domain`).
- Server-side billing and Stripe wiring exist in `services/api`, but not all flows are complete.
- **Gap to close now:** several UI flows still convert API failures into empty states (`catchError(() => of([]))` or equivalent). For production MVP, this is treated as a bug, not acceptable behavior.

## Target Behavior (Near-Term, Executable)
- API-first, no mock/demo fallbacks in production code.
- Clear loading/error states for every async billing operation.
- Consistent handling of core billing entities already modeled in the app/API:
  - accounts, contacts, payment methods, plans/prices/coupons
  - subscriptions, invoices, charges, refunds, credit notes
  - disputes, dunning events/queue, webhook events, audit logs

## Ownership Boundaries
- **Frontend (`apps/payments-admin`) owns:**
  - Route structure, UX, accessibility, view models, API request orchestration, client-side validation, optimistic UI only when safe.
  - Rendering RBAC-aware UI (hide/disable controls based on role) while assuming backend remains source of truth.
- **API (`services/api`) owns:**
  - Authentication/authorization enforcement, billing business rules, Stripe calls, idempotency enforcement, persistence, and audit log creation.
  - Any operation that mutates financial state or Stripe state.
- **Shared contracts (`packages/domain`) own:**
  - Canonical DTOs/enums used by frontend + API.
  - Breaking contract changes must be coordinated across all three areas in one planned change set.

## Integration & Data-Contract Rules
- Use real endpoints under `/api/v1/auth/**` and `/api/v1/billing/**`; do not add local mock data services.
- No silent fallback behavior:
  - Do not replace failed API calls with fake success or empty collections that hide operational failures.
  - Surface actionable UI errors and preserve observability.
- Keep API usage centralized:
  - Use `ApiClient`/`BillingApiService` patterns for billing operations.
  - Do not scatter ad hoc billing URLs across page components.
- Use domain contracts from `@aiaca/domain` first; avoid duplicating DTO shapes locally.
- Mutations must send idempotency keys (already supported by `ApiClient`); do not bypass this for billing writes.
- Stripe integration remains server-side:
  - Frontend must never hold Stripe secret keys or webhook secrets.
  - Frontend must not store PCI-sensitive card data (PAN/CVC/track data). Only tokenized/payment-method metadata allowed.

## Angular Implementation Standards (Mandatory for New Work)
- Standalone components only (`standalone: true`).
- Use `inject()` for dependency injection in new components/services/guards/interceptors.
- Explicit `imports` arrays in standalone components (no implicit module inheritance).
- Keep standalone app architecture (`bootstrapApplication`, `provideRouter`); do not introduce NgModules.

## Security & Privacy Baseline
- Follow `docs/security-privacy.md` and least-privilege defaults.
- Enforce role-aware UX for `ADMIN`, `OPERATOR`, `VIEWER`; never rely on client checks alone for security.
- Redact sensitive values in UI logs/errors/telemetry.
- Do not persist secrets or PCI-sensitive payloads in browser storage.
- Keep data exposure minimal in exports and on-screen details.

## Dev Workflow Commands
Run from repo root. In this environment, prefer npm scripts or Docker commands over direct `nx` CLI.

- Install deps: `npm ci`
- Serve app: `npm run nx -- serve payments-admin`
- Build app (dev): `npm run nx -- run payments-admin:build:development`
- Build app (prod): `npm run nx -- run payments-admin:build:production`
- Lint app: `npm run lint -- --projects=payments-admin`
- Test app: `npm run test -- --projects=payments-admin`
- Full local stack (when integration testing with API/DB): `npm run docker:up`

## Billing Change Risk Checklist (Must Pass Before Merge)
- **Idempotency**
  - All create/update/cancel/refund/retry actions are idempotent end-to-end.
  - Repeated submissions (refresh/retry/double-click) do not duplicate financial mutations.
- **RBAC / Least Privilege**
  - UI controls respect role permissions.
  - Backend rejects unauthorized mutations even if UI is bypassed.
- **Auditability**
  - Mutating actions leave traceable records (who, what, when, target entity, outcome).
  - Correlation IDs/request IDs are preserved where available.
- **Error Handling**
  - No silent fallbacks to mock or empty data on API failure.
  - User gets clear error state and recovery path (retry, contact ops, etc.).
  - Partial failures are visible and do not imply successful settlement.
- **Data Contract Integrity**
  - DTO changes are reflected in `packages/domain`, frontend usage, and API serialization together.
  - Pagination/filter/sort semantics are consistent between UI and API.
- **Security/Privacy**
  - No PCI-sensitive storage in frontend.
  - Sensitive fields redacted in logs and UI where appropriate.
  - Changes align with `docs/security-privacy.md`.
