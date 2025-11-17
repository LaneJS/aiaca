# Marketing Site (Angular)

This Angular app powers the public marketing experience for AACA, including the free scan flow.

## Getting Started
- Install dependencies at the repo root: `npm install`
- Run the dev server: `npx nx serve marketing-site`
- Build for production: `npx nx build marketing-site`
- Run unit tests: `npx nx test marketing-site`
- Lint the app: `npx nx lint marketing-site`

## Design tokens
- Colors: primary `#1d4ed8`, text `#0f172a`, muted `#475569`, backgrounds `#f8fafc`/white.
- Radii: `var(--radius-lg)` (`1rem`) for cards and panels.
- Shadows: `var(--shadow-card)` used on cards, hero, and callouts.
- Typography: Inter/system stack defined in `src/styles.scss` with consistent heading and paragraph spacing.

## Pages & routes
- `/` home with hero, problem statement, features, pricing teaser, and social proof placeholder.
- `/how-it-works` outlines the 3-step flow and a11y commitments.
- `/pricing` lists free and starter plans plus FAQ.
- `/resources` contains FAQs and guides placeholders.
- `/scan` provides the free scan form and results preview.

## API configuration
The scan form posts to `POST /api/v1/public/scans` using a base URL resolved by `getApiBaseUrl` from `@aiaca/config`. Override via `AACA_API_BASE_URL`, `NX_PUBLIC_API_BASE_URL`, `PUBLIC_API_BASE_URL`, or by setting `window.__AACA_API_BASE_URL__`.

## Accessibility & SEO
- Skip link, semantic landmarks, and accessible navigation states are built into the shell.
- Each page sets a Title/Meta description plus Open Graph tags via `SeoService`.
- CTA buttons ensure visible focus styles and support anchors, router links, and buttons.

## Open questions
- Final pricing numbers for Starter/Team/Agency tiers.
- Canonical production domain for SEO base URL in `SeoService` (currently `https://aaca.test`).
- Whether to surface a cookie/banner for analytics on the marketing site.
