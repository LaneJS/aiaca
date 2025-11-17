# Smoke Tests – Launch Readiness

- **Date:** 2025-11-17
- **Environments:**
  - Public free scan: marketing dev server (`npm run start:marketing`, API mocked via `/public/scans` stub)
  - Auth flows & scans: dashboard dev server + API container via `docker compose up api scanner`
  - Embed script: local demo page (`packages/embed-script/docs/demo.html`) served with `npx http-server`

## 1) Public Free Scan (anonymous)
- **Steps**
  1. Open `http://localhost:4200/scan`.
  2. Enter `https://example.com` and agree to consent note.
  3. Submit and wait for status to change to "Scan complete".
- **Expected**
  - Shows score, top 5 issues, and CTA to sign up.
- **Result**
  - ✅ Returned score 82 with 5 issues; CTA rendered. Rate limit message appears after 5 rapid submissions as expected.

## 2) Signup → Add Site → Run Scan → View Issues
- **Steps**
  1. Sign up via `http://localhost:4300/auth/signup` (demo user auto-seeded on API for re-runs).
  2. Add site domain `https://sample.a11y.test` from “Get Started” checklist.
  3. Trigger scan from site detail page.
  4. Open latest scan detail card.
- **Expected**
  - Dashboard stores site, scan completes with stubbed issues, issue list supports filter + mark-as-fixed.
- **Result**
  - ✅ Site saved; scan completed with 12 issues (4 errors, 8 warnings). Filters and mark-as-fixed toggles work; AI suggestions visible for alt text and link text items.

## 3) Embed Script Install (demo page)
- **Setup**
  - Serve demo: `npx http-server packages/embed-script/docs -p 8080`.
  - Inject script tag using demo site ID and embed key from seeded API response.
- **Validation**
  - Before script load: images missing `alt`, no skip link.
  - After load: alt text applied from API response; skip link appears before header and focuses `#main` on Enter.
  - Console shows GET `/sites/{id}/embed-config` 200 with `autoFixes.altText=true`, `enableSkipLink=true`.
- **Result**
  - ✅ Alt text and skip link confirmed. Focus outline CSS patch present; no errors logged.

## Notes / Follow-ups
- Free scan and dashboard flows rely on seeded data while staging auth is wired up; update smoke doc once staging API endpoints are public.
- Embed demo uses local API; CDN URL mapping to production to be validated during staging cutover.
