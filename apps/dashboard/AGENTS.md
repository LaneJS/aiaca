# Dashboard Contributor Guide

## Scope And Mission

This guide applies only to `apps/dashboard`.

`apps/dashboard` is the authenticated SaaS UI for AACA (AI Accessibility Compliance Assistant). It is responsible for customer workflows:
- site management
- scan execution and monitoring
- issue triage and status updates
- report export/sharing
- embed script setup
- account and billing status views

The dashboard is a production customer surface, not a demo app.

## Architecture And Dependency Map

### Runtime flow

1. Browser loads dashboard SPA.
2. Dashboard calls `environment.apiBaseUrl` (must be `/api/v1`).
3. In Docker, `apps/dashboard/nginx.conf` proxies `/api/` to `http://api:8080`.
4. Spring Boot API handles business logic and talks to scanner/AI services as needed.

### Service boundaries

- Dashboard talks to:
  - `services/api` only, via `/api/v1/*`
- Dashboard must never talk directly to:
  - `services/scanner`
  - `services/ai-orchestrator`
  - internal container hostnames from browser code (`http://api:8080`, etc.)

### Config surfaces (dashboard-owned)

Defined in:
- `apps/dashboard/src/environments/environment.ts`
- `apps/dashboard/src/environments/environment.prod.ts`

Required keys:
- `apiBaseUrl` (API prefix; keep as `/api/v1`)
- `cdnBaseUrl` (embed script CDN origin)
- `marketingSiteUrl` (auth/signup link target)

### Contract alignment

- Prefer DTO/validation alignment with `packages/domain` contracts.
- If API payloads change, update dashboard models and mappings in the same PR (or coordinated PRs) and verify no silent fallback behavior is introduced.

## Current MVP Focus (Section 18 Priority)

Top priority is production hardening. Every dashboard change should reinforce:

1. No mock/demo fallbacks in production paths.
2. Strict API integration with explicit error states.
3. Robust auth, loading, and retry behavior.
4. Persistent issue status updates backed by API.

Concrete expectations:
- remove or reject any `catchError(() => of(mockData))` pattern for API reads/writes.
- never auto-create demo sessions when auth fails.
- issue status toggle must call backend and survive refresh.
- async views must show loading + actionable error UI (not silent failure).
- token/session handling must avoid insecure persistence and must not leak secrets.

## Angular Implementation Rules (Monorepo Standard)

For new work in dashboard:
- use standalone components (`standalone: true`)
- use `inject()` instead of constructor DI
- declare all required dependencies in component `imports`
- use `provideRouter()` + `bootstrapApplication()` for new bootstrap/routing work
- do not introduce new NgModule-based patterns, even if legacy module bootstrapping still exists

## Security And Privacy Baseline

Follow `docs/security-privacy.md` and treat it as required policy:
- no token leakage (logs, toasts, errors, telemetry)
- no silent mock fallbacks on API failure
- sanitize user-visible error output (no backend stack traces/internal details)
- avoid persisting or exposing unnecessary sensitive data

## Developer Workflow (Dashboard)

Run from repo root.

### Install

```bash
npm install
```

### Local dashboard dev

```bash
npm run nx -- serve dashboard --configuration=development
```

Note: this runs Angular dev server only. For realistic `/api/v1` proxy behavior, prefer Docker.

### Lint, test, build (avoid direct `nx` CLI when practical)

```bash
npm run lint -- --projects=dashboard
npm run test -- --projects=dashboard
npm run build -- --projects=dashboard --configuration=production
```

### Docker path (recommended integration path)

```bash
docker compose up --build dashboard
```

This starts dashboard with dependencies (`api`, `postgres`) and uses Nginx proxy config in `apps/dashboard/nginx.conf`.

Default URL:
- dashboard: `http://localhost:4300`

## Guardrails And Anti-Patterns

Do:
- keep API access centralized in core services
- provide explicit loading/error/empty states for async screens
- keep auth/session behavior deterministic and visible to the user
- keep environment-driven URLs in environment files

Do not:
- add mock data fallbacks in live API paths
- hide backend failures behind fake/demo content
- hardcode production or container URLs in components/services
- call scanner/AI services directly from dashboard
- log tokens or raw sensitive server responses
- introduce new NgModule-based feature code

## PR Checklist (Dashboard Changes)

- [ ] No mock/demo fallback behavior added (or reintroduced).
- [ ] All affected API calls use real backend endpoints and typed contracts.
- [ ] Error states are explicit and sanitized; no silent failures.
- [ ] Loading states are present for every user-visible async action.
- [ ] Auth/session changes avoid token leakage and handle expiry/unauthorized paths.
- [ ] Issue status updates persist via API and are verified after refresh.
- [ ] `apiBaseUrl`, `cdnBaseUrl`, and `marketingSiteUrl` usage remains environment-driven.
- [ ] Any contract changes are aligned with `packages/domain` and backend API.
- [ ] Lint/test/build commands for dashboard were run and pass.
- [ ] Changes stay within dashboard scope and do not break Docker `/api/v1` proxy flow.
