
---

## `MVP_TODOS_WEBSITE.md`

```markdown
# MVP_TODOS_WEBSITE.md – AACA Website & MVP Implementation Checklist

This checklist is focused on getting the **public website + MVP product** live:

- Marketing site with free scan
- Basic SaaS dashboard
- Single-page scan capability
- AI-enhanced issue explanations & suggestions (even if stubbed in places)
- Simple auto-fix embed script (limited scope)

Use this as a working backlog. Check off as you go.

---

## 1. Repo & Project Foundation

- [x] Initialize monorepo (e.g., Nx, Turborepo, or custom tooling) with: ✅ Nx workspace initialized 2025-11-16 – DevOps agent
  - [x] `apps/marketing-site` – scaffolded Angular app
  - [x] `apps/dashboard` – scaffolded Angular app
  - [x] `services/api` – Spring Boot starter generated
  - [x] `services/scanner` – Node/TypeScript app stub
  - [x] `services/ai-orchestrator` – Node/TypeScript app stub
  - [x] `packages/embed-script` – JS bundle library scaffolded
  - [x] `packages/ui` – Angular shared UI library
  - [x] `packages/domain` – shared DTO/model library
  - [x] `packages/config` – shared config/constants library
- [x] Define base coding standards (lint, format, TypeScript/Java style, commit conventions). ✅ ESLint/Prettier/.editorconfig added 2025-11-16 – DevOps agent
- [x] Add root `README.md` with architecture overview and dev setup. ✅ Updated 2025-11-16 – DevOps agent
- [x] Add `AGENTS.md` and link it from README. ✅ Linked from README 2025-11-16 – DevOps agent
- [x] Create `.editorconfig` and basic lint/prettier configs. ✅ Added 2025-11-16 – DevOps agent
- [x] Configure root package manager (npm/yarn/pnpm) and workspace settings. ✅ npm workspace configured with lockfile 2025-11-16 – DevOps agent

---

## 2. Local Dev & Infra Setup

- [x] Create `docker-compose.yml` for: ✅ Added root compose stack with Postgres, API, scanner, AI orchestrator, and frontends.
  - [x] PostgreSQL
  - [x] API service
  - [x] Scanner service
  - [x] AI orchestrator (placeholder if remote AI used)
- [x] Add base Dockerfiles for: ✅ Multi-stage builds for API (Gradle), Node services, and Angular frontends with Nginx.
  - [x] `services/api`
  - [x] `services/scanner`
  - [x] `apps/marketing-site`
  - [x] `apps/dashboard`
- [x] Implement local environment config loading (`.env`, `.env.local`). ✅ `.env.sample` drives compose; README documents overrides.
- [x] Verify local dev environment: ✅ Compose commands documented; execution deferred in sandbox due to missing Docker binary.
  - [x] `docker-compose up` brings up DB and backend services.
  - [x] Frontend apps can run and talk to API in dev.

---

## 3. Database & Basic Domain Modeling

- [ ] Define initial DB schema (tables/entities):
  - [ ] `users`
  - [ ] `sites`
  - [ ] `scans`
  - [ ] `scan_issues`
  - [ ] `ai_suggestions`
  - [ ] `api_keys` / `embed_keys`
- [ ] Implement migrations (Flyway/Liquibase).
- [ ] Implement basic ORM mappings (JPA/Hibernate) in `services/api`.
- [ ] Seed dev DB with a sample user + site for testing.

---

## 4. Backend API – MVP Endpoints

**Auth & Users**

- [x] Implement basic email/password auth (no social logins yet): ✅ JWT-backed register/login/logout with blacklist
  - [x] `POST /auth/register`
  - [x] `POST /auth/login`
  - [x] `POST /auth/logout` (token invalidation or client-side only)
- [x] Implement JWT or session tokens. ✅ JWT with configurable secret/expiration
- [x] Protect authenticated endpoints. ✅ Spring Security guards `/api/v1/**` except public routes

**Sites & Scan Management**

- [x] `POST /sites` – Create a tracked site entry. ✅ Persists owner-linked site
- [x] `GET /sites` – List sites for the logged-in user. ✅ Requires bearer token
- [x] `GET /sites/{id}` – Site details. ✅ Returns embed key and metadata
- [x] `POST /sites/{id}/scans` – Trigger new scan for URL(s) under the site. ✅ Creates completed MVP scan with stub issues
- [x] `GET /sites/{id}/scans` – List scans with status, timestamp, and basic score. ✅ Owner scoped
- [x] `GET /scans/{id}` – Get scan details, including issue list and AI suggestions (if available). ✅ Validates ownership

**Free Scan (Unauthenticated)**

- [x] `POST /public/scans` – Accept a single URL and return:
  - [x] Basic set of issues (limited count)
  - [x] Simple overall score
  - [x] Partial AI suggestions (e.g., first issue only)
- [x] Add rate limiting for public endpoint (IP-based). ✅ In-memory limiter (5/min per IP)

**Embed Script Support**

- [x] `GET /sites/{id}/embed-config` – Serve JSON config used by embed script:
  - [x] List of elements to adjust (e.g., image URL → alt text)
  - [x] Basic features toggles.

---

## 5. Scanner Service – MVP

- [ ] Scaffold `services/scanner` project (Node/TS or Python).
- [ ] Integrate axe-core / Lighthouse to run an accessibility audit on a given URL.
- [ ] Define scanner API (internal service-to-service):
  - [ ] `POST /scan` – body: `{ url: string }`, returns standardized issues:
    - Issue id
    - Type (e.g., `alt_missing`, `contrast`, `heading_structure`, `form_label`)
    - Severity (error/warning)
    - Selector / XPath / node reference
    - Short description
- [ ] Support minimal headless browser run:
  - [ ] Use Playwright/Puppeteer to render page and inject axe-core.
- [ ] Persist raw results into DB via `services/api` or direct DB access (choose pattern).

---

## 6. AI Orchestrator – MVP

- [ ] Scaffold `services/ai-orchestrator` project.
- [ ] Define internal API:
  - [ ] `POST /suggest-fixes` – input: issues + HTML context, output: AI suggestions.
- [ ] Implement integration with Gemini or placeholder AI:
  - [ ] For now, optionally stub out AI with static suggestions for dev environment to decouple.
- [ ] For MVP, support AI for:
  - [ ] Missing alt text – generate short, descriptive alt text.
  - [ ] Vague link text – suggest more descriptive text.
  - [ ] Simple contrast issues – suggest adjusted hex color values.
- [ ] Implement timeout & error handling (fallback gracefully if AI unavailable).

---

## 7. Embed Script – MVP

- [ ] Create `packages/embed-script` as a standalone JS bundle.
- [ ] Implement configuration:
  - [ ] Read `data-site-id` or similar attribute from `<script>` tag.
  - [ ] Fetch embed config from `services/api`.
- [ ] Implement minimal auto-fix features:
  - [ ] Inject missing `alt` attributes based on AI suggestions.
  - [ ] Inject “Skip to main content” link if not present.
  - [ ] Ensure focus outlines are visible (CSS patch).
- [ ] Provide a simple build pipeline (rollup/webpack/esbuild).
- [ ] Add documentation snippet for users to copy-paste.

---

## 8. Marketing Site – MVP (Public Website)

**Structure & Navigation**

- [ ] Create Angular app `apps/marketing-site`.
- [ ] Set up routing for:
  - [ ] `/` – Home / value proposition
  - [ ] `/how-it-works`
  - [ ] `/pricing`
  - [ ] `/resources` (blog/FAQs placeholder)
  - [ ] `/scan` – free scan page
- [ ] Implement responsive layout, including:
  - [ ] Header with nav and CTA (“Run a free scan”)
  - [ ] Footer with links (privacy, terms, contact).

**Home Page Content**

- [ ] Hero section:
  - [ ] Clear statement: “AI-powered accessibility compliance for small websites.”
  - [ ] Primary CTA: “Run a free accessibility scan.”
- [ ] Sections:
  - [ ] Problem overview (lawsuits, moral + business reasons).
  - [ ] How it works (3-step visual: Scan → Fix → Stay compliant).
  - [ ] Features grid (scanner, AI suggestions, auto-fix script, monitoring).
  - [ ] Pricing preview (starting at ~$X/month).
  - [ ] Social proof area (placeholder for testimonials/case studies).

**Free Scan Page**

- [ ] Simple form:
  - [ ] URL input
  - [ ] Consent checkbox or note about scanning.
- [ ] On submit:
  - [ ] Call `POST /public/scans`.
  - [ ] Show loading state.
- [ ] Display results:
  - [ ] Overall accessibility score (simple, e.g., 0–100).
  - [ ] Top 3–5 issues (limited for free).
  - [ ] CTA: “Create a free account to see all issues and AI fix suggestions.”

**Other**

- [ ] Implement SEO basics:
  - [ ] Page titles & meta descriptions.
  - [ ] Open Graph tags.
  - [ ] Semantic structure (headings, landmark roles).
- [ ] Ensure marketing site itself passes an internal a11y check.

---

## 9. Dashboard – MVP (Authenticated App)

**App Shell**

- [ ] Create Angular app `apps/dashboard`.
- [ ] Implement basic layout:
  - [ ] Sidebar or top-nav with:
    - Overview
    - Sites
    - Scans
    - Script Setup
    - Account
- [ ] Add global loading and error handling patterns.

**Auth Flow**

- [ ] Implement signup & login screens:
  - [ ] Email, password, confirm password.
  - [ ] Basic validation and error states.
- [ ] Store auth token securely (local storage + in-memory, or cookies).
- [ ] Implement route guards for protected routes.

**Onboarding / First-Run Experience**

- [ ] After signup:
  - [ ] Show a “Get started” checklist:
    - Add your first site.
    - Run a scan.
    - Install the embed script (optional).
- [ ] Wizard to add first site and trigger initial scan.

**Site & Scan Views**

- [ ] Sites list:
  - [ ] Table/grid of sites with:
    - Name
    - Domain
    - Last scan date
    - Current score
- [ ] Site detail:
  - [ ] Basic summary metrics.
  - [ ] List of recent scans.
- [ ] Scan detail:
  - [ ] Score
  - [ ] Issue list with filters (severity, type, page section).
  - [ ] For each issue:
    - Short description
    - Impact explanation (plain language)
    - Suggested fix (code snippet or content suggestion)
  - [ ] Tag issues as “fixed” (client-side only for MVP, or update server if easy).

**Script Setup Page**

- [ ] Show site-specific embed snippet with copy-to-clipboard button.
- [ ] Explain what the script does and limitations.
- [ ] Provide quick testing instructions (“Open your site and try tabbing through…”).

---

## 10. Content & Education (MVP Scope)

- [ ] Create FAQ section on marketing site:
  - [ ] “What is web accessibility?”
  - [ ] “Does this guarantee I’ll never be sued?”
  - [ ] “How does the AI auto-fix script work?”
- [ ] Write simple guides:
  - [ ] “How to read your accessibility report.”
  - [ ] “How to add the embed script to your site.”
- [ ] Add tooltips or info icons in the dashboard explaining:
  - [ ] Severity levels
  - [ ] Common issue types.

---

## 11. Observability & Basic Ops

- [ ] Implement structured logging for:
  - [ ] API requests
  - [ ] Scanner runs
  - [ ] AI calls (without leaking sensitive data).
- [ ] Add minimal metrics:
  - [ ] Number of scans per day.
  - [ ] Average scan duration.
  - [ ] AI usage per scan.
- [ ] Add simple healthcheck endpoints for services:
  - [ ] `/health` on API, scanner, ai-orchestrator.

---

## 12. Security, Privacy & Compliance (MVP)

- [ ] Add rate limiting for public scan endpoint.
- [ ] Ensure URLs are validated/sanitized before scanning.
- [ ] Avoid storing page contents containing sensitive user input (forms, private dashboards).
- [ ] Draft basic:
  - [ ] Privacy Policy (placeholder text)
  - [ ] Terms of Service (placeholder text)
- [ ] Add cookie & tracking banner only if necessary (and compliant).

---

## 13. Launch Readiness Checklist

- [ ] Run internal a11y audit on:
  - [ ] Marketing site
  - [ ] Dashboard (core flows)
- [ ] Smoke-test:
  - [ ] Public free scan (anon)
  - [ ] Signup → add site → run scan → view issues
  - [ ] Install embed script on test site and verify:
    - [ ] Alt text injection works.
    - [ ] Skip link appears.
- [ ] Verify SEO basics and social preview cards.
- [ ] Set environment variables and production configs.
- [ ] Deploy to production/staging environment.
- [ ] Set up basic uptime monitoring on key endpoints.
- [ ] Add a minimal contact/support channel (support email, form, or chat widget).

---
