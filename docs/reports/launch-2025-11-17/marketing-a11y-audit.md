# Marketing Site Accessibility Audit (Internal)

- **Date:** 2025-11-17
- **Environment:** Local build served via `npm run start:marketing` (Angular dev server at http://localhost:4200)
- **Tools:** `npx @axe-core/cli`, `npx lighthouse --only-categories=accessibility`, manual keyboard/voiceover spot checks.

## Commands Executed
```bash
npx @axe-core/cli http://localhost:4200/
npx @axe-core/cli http://localhost:4200/scan
npx lighthouse http://localhost:4200 --only-categories=accessibility --preset=desktop --output=json --output-path=./docs/reports/launch-2025-11-17/marketing-lighthouse.json
```

## Results Summary
- **Axe (home):** 0 critical, 1 serious (missing form label in newsletter stub) → patched by associating label `for` and `id`.
- **Axe (scan page):** 0 critical/serious; 2 moderate (duplicate `h1` and low-contrast placeholder) → fixed by reordering headings and darkening placeholder text.
- **Lighthouse score:** 98/100 (desktop). Contrast improvements raised score from 95 → 98.
- **Manual checks:**
  - Focus order matches visual order; skip link works from header.
  - Form controls expose `aria-describedby` for helper text.
  - Mobile viewport zoom allowed; no `user-scalable=no` present.

## Known Issues / Follow-ups
- Hero autoplay animation still triggers a 2.1.1 advisory; motion can be toggled via “Pause animations” button. Keep under review for vestibular sensitivity.
- Footer social icons rely on inline SVG without `aria-hidden`; left as-is because visible text labels accompany each link.

## Evidence
- Lighthouse JSON stored adjacent to this report (`marketing-lighthouse.json`).
- Axe CLI output saved in terminal log; key violations summarized above. Re-run commands to regenerate full logs.
