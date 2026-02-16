# AGENTS.md – AI Accessibility Compliance Assistant Monorepo

This repository powers **AACA (AI Accessibility Compliance Assistant)**, a SaaS platform that scans websites for accessibility issues, produces AI-guided fixes, and supports optional embed-script auto-fix behavior.

This document is the **monorepo-level collaboration charter** for human and AI agents.

## Scope And Precedence

- Scope of this file: repository-wide defaults.
- If a subdirectory contains its own `AGENTS.md`, that local file is authoritative for that subtree.
- Current repo-local AGENTS files:
  - `apps/dashboard/AGENTS.md`
  - `apps/marketing-site/AGENTS.md`
  - `apps/payments-admin/AGENTS.md`
  - `apps/demo-site/AGENTS.md`
  - `services/api/AGENTS.md`
  - `services/scanner/AGENTS.md`
  - `services/ai-orchestrator/AGENTS.md`

## Current Repository Reality

### Tech stack in use

- Frontend: Angular (Nx workspace)
- Backend API: Java 21 + Spring Boot
- Scanner: Node + TypeScript + Fastify + Playwright + axe-core
- AI orchestration: Node + TypeScript + Fastify + `@google/genai`
- DB: PostgreSQL (Docker/local), H2 used by API test/default profile
- Infra/local orchestration: Docker Compose

### Active top-level layout

- `apps/marketing-site` – public site + free scan flow
- `apps/dashboard` – authenticated customer dashboard
- `apps/payments-admin` – internal billing/revenue operations UI
- `apps/demo-site` – intentionally imperfect demo for scanner/embed behavior
- `services/api` – primary REST API (`/api/v1`)
- `services/scanner` – scan execution service (`/scan`)
- `services/ai-orchestrator` – suggestion service (`/suggest-fixes`)
- `packages/embed-script` – runtime embed/autofix package
- `packages/ui` – shared Angular UI package
- `packages/domain` – shared schemas/contracts/types
- `packages/config` – shared environment/config helpers
- `docs` – legal, guides, reports, security/privacy posture
- `infra` – infra scaffolding
- `todos` – implementation plans and scoped execution docs

### Planned but not currently present

- `services/reporting/**`
- `infra/k8s/**`
- `tests/accessibility/**` (dedicated folder)

Do not assume planned paths exist when implementing changes.

## Core Architecture And Data Flow

1. Frontend apps call `services/api` through `/api/v1`.
2. `services/api` orchestrates scans and AI suggestions:
   - scanner: `POST /scan`
   - ai-orchestrator: `POST /suggest-fixes`
3. `packages/embed-script` consumes API-provided site config and applies controlled runtime fixes on customer sites.
4. `packages/domain` provides shared contracts used across services/apps.

### Docker Compose default host ports

- API: `8080`
- Scanner: `4001`
- AI orchestrator: `4002`
- Marketing site: `4200`
- Dashboard: `4300`
- Demo site: `4400`
- Payments admin: `4500`
- Postgres: `5432`

## Global Conventions

- Accessibility-first: AACA should model the standards it enforces.
- Contract-first: treat API and shared schema changes as coordinated, not isolated.
- Deterministic behavior: avoid hidden fallback logic in production paths.
- Security/privacy baseline: follow `docs/security-privacy.md`.
- Keep services composable, explicit, and testable.
- Avoid manual one-off steps when automation is practical.

## Angular Standards (Mandatory For New Work)

- Use standalone components (`standalone: true`).
- Use `inject()` over constructor DI in new code.
- Import dependencies explicitly in component `imports`.
- Use `provideRouter()` for routing setup.
- Use `bootstrapApplication()` for standalone bootstrapping.
- Do not introduce new NgModule-centric architecture.
- Existing legacy NgModule code can remain until intentionally migrated.

Tooling note for this environment:
- Prefer npm scripts or Docker commands over direct `nx` CLI invocation where possible.
- Example: `npm run lint -- --projects=dashboard`.

## Agent Catalog

### Product & Specification Agent

**Mission:** translate goals into executable specs, acceptance criteria, and prioritization.

**Owns:**
- `docs/**` product/spec planning documents
- `todos/**` roadmap execution plans

**Responsibilities:**
- keep MVP flow definitions current (scan, triage, embed setup, monitoring)
- align acceptance criteria across frontend/backend/service boundaries
- keep priorities explicit and implementable

### UX & Content Agent

**Mission:** ensure product language and information architecture are clear, trustworthy, and accessible.

**Owns:**
- marketing copy surfaces in `apps/marketing-site/src/**`
- dashboard explanatory copy (for example issue explanations)
- content guidance docs in `docs/**`

**Responsibilities:**
- keep plain-language content for non-experts
- maintain a11y-safe interaction and copy patterns
- ensure legal/trust messaging stays aligned with docs and behavior

### Frontend Web App Agent

**Mission:** build and maintain Angular UIs.

**Owns:**
- `apps/marketing-site/**`
- `apps/dashboard/**`
- `apps/payments-admin/**`
- `apps/demo-site/**`
- `packages/ui/**`

**Responsibilities:**
- build accessible, responsive features
- integrate against real API contracts
- remove/avoid silent mock fallbacks in production flows
- preserve app-specific intent (for example demo-site stays intentionally imperfect)

### Backend API Agent

**Mission:** provide stable, secure REST interfaces and orchestration.

**Owns:**
- `services/api/**`
- API-facing shared contract alignment with `packages/domain/**`

**Responsibilities:**
- maintain `/api/v1` contracts for auth, sites, scans, embed config, billing
- orchestrate scanner + ai-orchestrator with correlation IDs and timeout handling
- enforce auth, validation, rate limits, and privacy constraints

### Scanner Engine Agent

**Mission:** produce normalized, machine-readable accessibility findings.

**Owns:**
- `services/scanner/**`

**Responsibilities:**
- run and normalize Playwright + axe-core scans
- enforce URL sanitization via shared contract helpers
- preserve data minimization/redaction and deterministic output

### AI Orchestration Agent

**Mission:** convert findings into structured, validated suggestions.

**Owns:**
- `services/ai-orchestrator/**`

**Responsibilities:**
- use `@google/genai` with default model `gemini-2.0-flash-exp`
- preserve strict request/response schema behavior via `packages/domain`
- enforce limits/timeouts/budget controls and stub fallback behavior

### Embed Script Agent

**Mission:** maintain lightweight runtime auto-fix behavior for customer sites.

**Owns:**
- `packages/embed-script/**`

**Responsibilities:**
- keep script small, performant, and privacy-preserving
- apply reversible, non-destructive DOM/CSS enhancements
- stay aligned with API-provided per-site configuration

### Data & Persistence Agent

**Mission:** maintain durable data models and migration safety.

**Owns:**
- `services/api/src/main/resources/db/**`
- DB migration strategy and schema quality

**Responsibilities:**
- evolve schema for users/sites/scans/issues/suggestions/billing
- ship migration + index strategy with backwards-safe rollout
- support retention and cleanup strategy decisions

### DevOps & Infra Agent

**Mission:** keep local and deployment workflows reproducible and observable.

**Owns:**
- `docker-compose.yml`
- `infra/**`
- environment and runtime integration guidance

**Responsibilities:**
- keep local stack reliable (API, scanner, orchestrator, frontends, Postgres)
- maintain build/test/deploy hygiene
- own shared security/privacy guardrail rollouts

### QA & Accessibility Guardrail Agent

**Mission:** prevent regressions and enforce accessibility quality.

**Owns:**
- `apps/*-e2e/**` and test harness surfaces
- cross-app quality gates and regression strategy

**Responsibilities:**
- maintain automated and manual checks for key user flows
- verify a11y behavior for core journeys
- ensure changes are validated against real API behavior where applicable

### Documentation & DX Agent

**Mission:** make onboarding and contribution predictable.

**Owns:**
- root `README.md`
- root `AGENTS.md`
- `docs/**`

**Responsibilities:**
- keep setup and workflow docs accurate
- keep cross-service contract docs discoverable
- reduce contributor ambiguity across repos

## Active Priorities

### 1) Dashboard MVP Production Hardening (High Priority)

- Scope: `apps/dashboard/**` + required API coordination
- Source of truth: `todos/18-dashboard-mvp-finalization.md`
- Focus:
  - remove demo/mock fallbacks
  - strict real API integration
  - robust auth/error/loading states
  - persistent issue status updates

### 2) Billing/Admin Integration Stabilization

- Scope: `apps/payments-admin/**` + `/api/v1/billing/**` in `services/api/**`
- Focus:
  - eliminate mock behavior
  - enforce idempotency and RBAC consistency
  - preserve auditability and safe operational UX

### 3) Security/Privacy Baseline Enforcement

- Source of truth: `docs/security-privacy.md`
- Focus:
  - public scan rate limiting
  - URL validation/sanitization
  - redaction and data minimization

## Coordination Rules For Cross-Service Changes

- Frontend/API contract changes:
  - update app usage + API DTO/controller/service mappings + `packages/domain` together.
- Scanner output shape changes:
  - update scanner normalization + API scanner client mapping + affected tests/docs.
- AI suggestion schema/prompt/provider changes:
  - update `services/ai-orchestrator` + `packages/domain` + API consumer mappings.
- Billing model changes:
  - update API schema/migrations + billing endpoints + payments-admin integration in lockstep.

If a contract changes, include migration/compatibility notes in the same PR.

## Standard Workflow Commands (Repo Root)

- Install dependencies: `npm install`
- Lint all: `npm run lint`
- Test all: `npm run test`
- Build all: `npm run build`
- Format: `npm run format`
- Start full Docker stack: `npm run docker:up:build`
- Stop Docker stack: `npm run docker:down`

For API-specific Spring work, use wrapper commands in `services/api`:
- `./gradlew test`
- `./gradlew bootRun`

## Definition Of Done (Production-Facing Changes)

- No silent fallback behavior introduced in live paths.
- Error and loading states are explicit and user-actionable.
- Security/privacy controls remain enforced.
- Contracts and dependent consumers are updated together.
- Lint/test/build pass for impacted projects.
- Scope-specific docs/AGENTS references are updated when behavior changes.
