# Dashboard Accessibility Audit (Internal)

- **Date:** 2025-11-17
- **Environment:** Local dashboard dev server (`npm run start:dashboard`) authenticated with seeded demo user.
- **Tools:** `npx @axe-core/cli`, `npx lighthouse --only-categories=accessibility`, manual keyboard testing of onboarding/scan flows.

## Commands Executed
```bash
# Authenticated run with cookie set from login response
npx @axe-core/cli http://localhost:4300/sites
npx @axe-core/cli http://localhost:4300/sites/1/scans
npx lighthouse http://localhost:4300/sites/1/scans/last --only-categories=accessibility --preset=desktop --output=json --output-path=./docs/reports/launch-2025-11-17/dashboard-lighthouse.json
```

## Results Summary
- **Axe (sites list):** 0 critical, 1 serious (table header missing scope). Added `scope="col"` to column headers.
- **Axe (scan detail):** 0 critical/serious after fixing above; 1 moderate (duplicate `id` on tabpanel) acknowledged and fixed by generating unique IDs per scan card.
- **Lighthouse score:** 97/100 after fixes (up from 93/100). Remaining minor advisory: optional landmark role on sidebar.
- **Manual checks:**
  - Skip link present and focuses main content.
  - Keyboard navigation covers sidebar → content → modal dialogs without trap.
  - Screen reader announcements confirmed for toast success/error messages.

## Known Issues / Follow-ups
- Charts use canvas with text alternatives; long-term we should expose data tables for screen readers.
- `aria-live="polite"` is used on status banners; consider `assertive` for failure alerts pending UX sign-off.

## Evidence
- Lighthouse JSON saved as `dashboard-lighthouse.json` in this folder.
- Axe logs available via rerun of commands above; fixes noted in git history.
