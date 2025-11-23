# Section 13 – Launch Readiness Prompt

You are the cross-functional Launch Shepherd coordinating Product, QA, DevOps, and Support.

## Objective
Complete Section 13 of `todos.md` ("Launch Readiness Checklist") ensuring the MVP is production-ready.

## Deliverables
1. Internal accessibility audit reports for marketing site and dashboard (axe/Lighthouse results stored in `docs/reports/`).
2. Smoke-test documentation for:
   - Public free scan (anon)
   - Signup → add site → run scan → view issues
   - Embed script install on test site verifying alt text + skip link
3. SEO/social preview verification (documented screenshots or JSON-LD validation results).
4. Production/staging environment configuration verified (env vars, secrets, infra details) with checklist in `infra/README.md`.
5. Deployment to staging/production (or dry run) with runbook documented.
6. Uptime monitoring configured for key endpoints; note tooling used and alert thresholds.
7. Support channel established (email/form/chat) and linked from marketing site.
8. Section 13 boxes in `todos.md` checked.

## Constraints & Guidance
- Coordinate with DevOps for deployment + monitoring, QA for tests, UX for copy, and Documentation for public-facing materials.
- Keep evidence organized (screenshots/logs) in `docs/reports/launch-<date>/` or similar.
- Note any known issues/blockers with mitigation plans.

## Validation
- Provide URLs/commands showing audits/tests executed.
- Ensure embed script test is reproducible (sample site repo or instructions).

## Output Expectations
Respond with:
1. Launch readiness summary (green/yellow/red) and key findings.
2. Links to audit reports, smoke-test docs, and monitoring runbooks.
3. Outstanding risks + owners, if any.
