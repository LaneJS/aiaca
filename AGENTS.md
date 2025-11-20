# AGENTS.md – AI Accessibility Compliance Assistant Monorepo

This repository powers **AACA (AI Accessibility Compliance Assistant)**:  
a SaaS platform that scans websites for accessibility issues, suggests AI-powered fixes, and offers an optional auto-fix script for continuous ADA/WCAG compliance.

This document defines **agents** (human or AI) that collaborate on the monorepo, their areas of ownership, and how they interact.

---

## Global Conventions

- **Tech stack (MVP)**  
  - Frontend (Dashboard + Marketing): Angular SPA  
  - Backend API: Java + Spring Boot  
  - Scanner / AI Orchestration: Node/TypeScript or Python services (TBD per service)  
  - DB: PostgreSQL  
  - Infra: Docker + container orchestration (initially docker-compose, later k8s)  
  - Cloud: Optimized for Google Cloud (Vertex/Gemini), but infra abstractions should not hard-code a single CSP.

- **Monorepo layout (proposed)**  
  - `apps/marketing-site` – public marketing + free scan landing pages  
  - `apps/dashboard` – authenticated SaaS UI  
  - `services/api` – main REST API (Spring Boot)  
  - `services/scanner` – accessibility scanner engine (axe-core, Lighthouse, headless browser)  
  - `services/ai-orchestrator` – Gemini / LLM / vision / OCR orchestration  
  - `services/reporting` – PDF/HTML report generation & compliance logs  
  - `packages/embed-script` – lightweight JS snippet injected into customer sites  
  - `packages/ui` – shared UI components  
  - `packages/domain` – domain models / DTOs / shared validation  
  - `packages/config` – shared configuration, env schema, constants  
  - `infra/` – IaC, CI/CD, docker-compose, k8s manifests  
  - `docs/` – product, API, and developer docs

- **Principles**
  - Accessibility first (dogfood our own rules).
  - Small, composable services; clear contracts.
  - Everything scriptable & testable (no “magic manual step” if it can be automated).
  - The product must feel **simple** even if the backend is complex.

---

## Agent: Product & Specification Agent

**Mission:** Translate business goals into actionable technical specs and user stories that the rest of the agents can execute against.

**Owns:**
- `docs/product/**`
- `docs/specs/**`
- `docs/roadmap.md`

**Responsibilities:**
- Maintain a living **MVP spec** for:
  - Free page scan
  - Paid dashboard & auto-fix script
  - Continuous monitoring
- Define **user personas** (small biz owner, freelance dev) and key flows:
  - “Run my first scan”
  - “Understand my issues”
  - “Deploy the one-line auto-fix script”
- Write API-level and UI-level acceptance criteria for each feature.
- Prioritize features along roadmap: MVP → Pro/Agency → Enterprise.

**Inputs:** Business plan, usage analytics, customer feedback.  
**Outputs:** Specs, user stories, acceptance tests, product roadmap.

---

## Agent: UX & Content Agent

**Mission:** Make the product simple, understandable, and trustworthy for non-experts.

**Owns:**
- `apps/marketing-site/src/**` (copy & information architecture)
- `apps/dashboard/src/app/**/copy.ts`
- `docs/content-style-guide.md`

**Responsibilities:**
- Design IA for:
  - Marketing site: Home → How it works → Pricing → Resources → Free Scan  
  - Dashboard: Overview → Issues → Reports → Monitoring → Script Setup
- Create human-friendly explanations for each issue type:
  - What it is, why it matters, how we fix it.
- Write accessible, plain-language copy (aimed at small business owners).
- Ensure all pages follow accessibility best practices (we should be “our own best example”).

**Inputs:** Product specs, WCAG guidance.  
**Outputs:** Wireframes, copy documents, UX flows, component content.

---

## Agent: Frontend Web App Agent

**Mission:** Build and maintain Angular-based UIs for the **marketing site** and **SaaS dashboard**.

**Owns:**
- `apps/marketing-site/**`
- `apps/dashboard/**`
- `packages/ui/**`

**Responsibilities:**
- Implement responsive, accessible UI components (tabs, accordions, modals, forms).
- Integrate with `services/api` for:
  - Free scan submission & results
  - Auth/session
  - Site management & monitoring configuration
- Implement charts and summaries (accessibility score, issue trends).
- Provide a “developer view” (raw details, code snippets) and “business view” (plain-language summary).

**Inputs:** Product specs, design & copy.  
**Outputs:** Production-ready Angular apps.

---

## Agent: Backend API Agent

**Mission:** Provide a secure, versioned REST API that connects frontend apps to the scanner, AI, and persistence layer.

**Owns:**
- `services/api/**` (Spring Boot)
- `packages/domain/**` (shared DTOs & validation)

**Responsibilities:**
- Implement endpoints for:
  - Auth (signup, login, password reset, basic role model)
  - Scan requests (single URL, later multi-page)
  - Fetch scan results & issue lists
  - Manage sites & embed keys
  - Reporting (PDF/HTML exports)
  - Billing integration (Stripe – later in MVP, stubbed initially)
- Define cross-service contracts for `scanner` and `ai-orchestrator`.
- Handle multi-tenancy and rate limiting for free vs paid usage.
- Enforce privacy & security constraints (do not store user form data; avoid PII leakage).

**Inputs:** Product specs, DB schema, scanner/AI contracts.  
**Outputs:** Stable, documented REST APIs.

---

## Agent: Scanner Engine Agent

**Mission:** Crawl and analyze web pages for accessibility issues using rule-based tools and light simulation.

**Owns:**
- `services/scanner/**`

**Responsibilities:**
- Integrate **axe-core** and/or **Lighthouse** to run accessibility audits.
- Provide a simple interface:
  - Input: URL, optional page HTML snapshot
  - Output: standardized list of issues with locations & severity
- Support:
  - Missing/empty alt text
  - Contrast issues
  - Heading structure
  - Form labels & ARIA issues
  - Link/button semantics
  - Keyboard focusability basics
- Use headless browser (Playwright/Puppeteer) to analyze SPA content.
- Emit machine-readable reports consumed by `ai-orchestrator` and `services/api`.

**Inputs:** URLs from `services/api`.  
**Outputs:** Raw, normalized accessibility issues.

---

## Agent: AI Orchestration Agent

**Mission:** Turn raw scanner findings into **AI-powered recommendations** using Gemini and other AI services.

**Owns:**
- `services/ai-orchestrator/**`

**Responsibilities:**
- Orchestrate calls to:
  - Gemini (LLM) for code & content suggestions.
  - Gemini Vision / OCR / other vision APIs for:
    - Alt text for images
    - Text extraction from images of text
- Produce **structured JSON** for each issue:
  - Explanation (plain language)
  - Suggested fix (code or CSS snippet)
  - Optional preview alt text / label text
- Enforce constraints:
  - Respect token & cost budgets per plan.
  - Avoid hallucinating non-existent elements (validate suggestions against DOM snapshot).
- Provide a deterministic interface to `services/api` and `packages/embed-script`.
- Use the official `@google/genai` SDK (Gemini API) with default model `gemini-2.0-flash-exp`; maintain structured JSON responses with response schemas.

**Inputs:** Scanner output, HTML snapshots, images.
**Outputs:** Structured AI suggestions & metadata.

---

## Agent: Embed Script Agent

**Mission:** Provide the one-line JavaScript snippet that applies **auto-fixes** on customer websites.

**Owns:**
- `packages/embed-script/**`

**Responsibilities:**
- Expose snippet, e.g.:
  ```html
  <script src="https://cdn.A11yAssistant.com/autofix.js" data-site-id="SITE_ID"></script>
  ```
- Fetch per-site configuration from services/api and apply:
  - Alt attributes
  - Skip links & landmarks
  - Contrast adjustments (minimal, non-destructive CSS tweaks)
  - Keyboard focus handlers for common patterns (menus, dialogs)
- Ensure:
  - Lightweight & performant (small bundle, tree-shaken).
  - Privacy-preserving (no user data collection).
  - Graceful degradation if backend unavailable.

**Inputs:** Site config & AI suggestions.  
**Outputs:** On-the-fly DOM & CSS enhancements at runtime.

---

## Agent: Data & Persistence Agent

**Mission:** Design and maintain relational schema and data-access layer.

**Owns:**
- `services/api/src/main/resources/db/**`
- `infra/db/**`
- DB migration tooling (Flyway/Liquibase)

**Responsibilities:**
- Model:
  - Users, subscriptions, sites
  - Scans, issues, AI suggestions
  - Monitoring schedules, notifications
- Implement migrations & verify performance for typical small-site usage.
- Design retention & cleanup strategies (e.g., old scan results).

**Inputs:** Product requirements, analytics needs.  
**Outputs:** DB schema, migration scripts, ERD documentation.

---

## Agent: DevOps & Infra Agent

**Mission:** Make it easy to build, test, deploy, and observe the system.

**Owns:**
- `infra/ci/**`
- `infra/docker/**`
- `infra/k8s/**`
- Observability setup

**Responsibilities:**
- Provide docker-compose for local dev (frontend, API, scanner, DB).
- CI/CD pipelines for:
  - Linting, tests, security checks, a11y checks.
  - Build & deploy to staging/production.
- Set up logging, metrics, basic alerting.
- Manage secrets and environment configuration.
- Own shared security/privacy controls documented in `docs/security-privacy.md` (rate limits, URL validation, redaction). Update services when these baselines change.

**Inputs:** Service definitions.  
**Outputs:** Reproducible deployments & observability.

---

## Agent: QA & Accessibility Guardrail Agent

**Mission:** Ensure AACA itself is a highly accessible product and that regressions are caught early.

**Owns:**
- `tests/e2e/**`
- `tests/accessibility/**`

**Responsibilities:**
- Automated UI tests (Cypress/Playwright).
- A11y test harness (axe, pa11y, etc.) integrated into CI.
- Manual checklists for key flows:
  - Running scans
  - Reading reports
  - Deploying embed script
- Maintain testing strategy for new features and regression suite.

**Inputs:** Product specs, UI components.  
**Outputs:** Test suites, bug reports, quality gates.

---

## Agent: Documentation & Developer Experience Agent

**Mission:** Make it trivial for new contributors and integrators to understand and extend the system.

**Owns:**
- `README.md`
- `AGENTS.md`
- `docs/**`

**Responsibilities:**
- Maintain onboarding guides (local dev, environment setup).
- Maintain API docs (OpenAPI spec, Postman collections).
- Provide “How to integrate AACA into your workflow” recipes (WordPress, custom sites, CI).

**Inputs:** Implementation details from all other agents.
**Outputs:** Clear docs and DX improvements.

---

## TODO: Section 18 – Dashboard MVP Production Finalization

**Mission:** Remove all demo/mock data and finalize the dashboard for production MVP launch.

**Agent:** Frontend Web App Agent + Backend API Agent (coordination required)

**Scope:** `apps/dashboard/**`

**See:** `todos/18-dashboard-mvp-finalization.md` for detailed implementation plan.

**Status:** Ready to start

**Priority:** HIGH - Blocking MVP launch

**Key Tasks:**
- Remove demo user fallback and implement proper auth error handling
- Replace all mock data with real API integration
- Fix issue status toggle to persist to backend
- Update hardcoded CDN URL to production domain
- Implement proper token storage (replace localStorage)
- Add loading states and scan progress tracking
- Remove silent mock data fallbacks on API errors

**Success Criteria:**
- Zero mock data in production build
- All API calls properly integrated with backend
- Graceful error handling without demo fallbacks
- Production-ready token storage
- Comprehensive testing evidence

---

## TODO: Section 19 – Embed Script Demo Site

**Mission:** Create a standalone demo website that showcases the AACA embed script (autofix.js) in action with a toggle to see before/after accessibility fixes.

**Agent:** Frontend Web App Agent + Database Setup

**Scope:** `apps/demo-site/**`

**See:** `todos/19-embed-demo-site.md` for detailed implementation plan.

**Status:** Ready to start

**Priority:** HIGH - Critical for sales demos and customer onboarding

**Key Tasks:**
- Create new Angular application at apps/demo-site
- Build demo website with intentional accessibility issues (missing alt text, no focus indicators, no skip link)
- Implement toggle component to dynamically enable/disable embed script
- Integrate with real backend API using fixed demo site ID and embed key
- Create database seed script with demo site, scan, and AI-generated alt text suggestions
- Configure Docker Compose service on port 4400
- Configure nginx to serve autofix.js at /autofix.js path
- Add demo images and content

**Success Criteria:**
- Demo site accessible at http://localhost:4400
- Toggle control visibly switches between before/after states
- Alt text suggestions applied from backend API when script enabled
- Focus outlines and skip link appear when script enabled
- All Docker services build and run successfully
- Database seed creates demo site with scan results
- No console errors when script loads
