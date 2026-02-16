# AGENTS.md - Marketing Site (`apps/marketing-site`)

Scope: all files under `apps/marketing-site/**`.

## Mission
The marketing site is AACA's public front door. It explains the product in plain language, builds trust, surfaces legal/privacy information, and drives users into the free scan and paid signup funnels.

This app is presentation and funnel UX. It does not orchestrate scanner or AI services directly.

## Primary User Journeys
1. Learn what AACA does and why it matters.
Routes: `/`, `/how-it-works`, `/pricing`, `/resources`.
Outcome: user understands value, risk reduction, and next action.

2. Run a free scan.
Route: `/scan`.
Outcome: submit URL, receive score and issue preview from public API.

3. Convert to paid onboarding.
Route: `/signup`.
Outcome: registration + checkout handoff via API response.

4. Review trust and legal terms.
Routes: `/legal/privacy`, `/legal/terms`.
Outcome: user can review current legal posture before submitting information.

## Content Responsibilities
- Keep copy accessible-first and understandable for non-experts (small business owners, non-technical operators).
- Prefer concrete language over jargon; explain impact and next step.
- Keep claims aligned with product behavior and current legal text.
- Preserve clear CTA hierarchy to free scan and signup flows.

## Integration Contracts
### Service Boundaries
- Only call API contracts exposed for marketing/public/auth flows.
- Do not call scanner, AI orchestrator, or internal service endpoints directly from this app.

### Public/Auth Endpoints
- Free scan submit contract: `POST {API_BASE_URL}/public/scans`.
- Required deployed path shape: `/api/v1/public/scans` (via configured base URL).
- Signup checkout handoff: `POST {API_BASE_URL}/auth/register-checkout`.
- Handle API failures explicitly in UI states; do not add silent fallback data.

### API Base URL and nginx Constraint
- `apps/marketing-site/Dockerfile` builds a static Angular bundle served by nginx.
- `apps/marketing-site/nginx.conf` does not define an `/api` reverse proxy.
- API base URL must be explicit in frontend config/logic, not implied by nginx.
- Use `getApiBaseUrl()` from `@aiaca/config`; do not hardcode API hosts inside components/templates.
- Keep base URL semantics clear: base should include `/api/v1`, then append endpoint paths.

### Cross-App and Cross-Docs References
- Dashboard references must point to the correct dashboard URL/path for the environment; avoid hardcoded localhost/staging links in copy.
- Legal pages in this app must stay consistent with legal source docs:
  - `docs/legal/privacy-policy.md`
  - `docs/legal/terms-of-service.md`
- Free scan CTA flows must continue to route users to `/scan`, then submit to the backend public scan endpoint contract above.

## Security and Privacy Guardrails
- Follow `docs/security-privacy.md` baseline.
- Do not add hidden tracking, pixels, fingerprinting, or non-essential cookies.
- Current posture: no non-essential cookie banner on marketing site.
- If analytics/cookies change, update legal/docs flow (including `docs/legal/cookie-banner-decision.md`) in the same PR.
- Never expose secrets or tokens in frontend code.

## Accessibility and UX Guardrails
- Every page must be keyboard navigable with visible focus and logical heading order.
- Forms require clear labels, inline error messaging, and accessible status updates (`role="alert"`/`aria-live` where appropriate).
- Maintain color contrast and semantic structure in marketing components.
- Keep IA simple: learn -> trust -> act.

## Angular Implementation Guardrails
- For new code, use standalone Angular components.
- Use `inject()` for dependency injection.
- Import Angular dependencies explicitly per component.
- For new routing/bootstrap work, prefer `provideRouter()` + `bootstrapApplication()`.
- Do not introduce new NgModule-based additions.
- Existing legacy module wiring may remain until intentionally migrated; do not expand legacy patterns.

## Workflow Commands
Use npm scripts or Docker commands in this environment; avoid direct `nx` CLI invocations.

- Install dependencies: `npm ci`
- Serve locally: `npm run nx -- run marketing-site:serve`
- Lint: `npm run lint -- --projects=marketing-site`
- Unit tests: `npm run test -- --projects=marketing-site`
- Production build: `npm run nx -- run marketing-site:build:production`
- Preview built static app: `npm run nx -- run marketing-site:serve-static`
- Build container image: `docker build -f apps/marketing-site/Dockerfile -t aaca-marketing-site:local .`
- Run container locally: `docker run --rm -p 8080:80 aaca-marketing-site:local`

## PR Checklist (Marketing Site)
- Copy accuracy: claims, pricing, and feature statements match current product behavior.
- Legal integrity: `/legal/privacy` and `/legal/terms` links work and reflect current legal source docs.
- Funnel integrity: primary CTAs still drive to `/scan` and `/signup` without dead ends.
- API integrity: free scan posts to configured `/api/v1/public/scans` path; no direct internal-service calls.
- Error UX: failed API calls show actionable, user-safe messages.
- Privacy posture: no hidden tracking additions; cookie posture unchanged unless explicitly approved.
- Accessibility outcomes: keyboard flow, focus states, labels, alerts, contrast, and heading structure verified.
- Quality gates: run lint, tests, and production build for `marketing-site` before merge.
