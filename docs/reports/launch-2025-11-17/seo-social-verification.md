# SEO & Social Preview Verification

- **Date:** 2025-11-17
- **Scope:** Marketing site (`/`, `/how-it-works`, `/pricing`, `/resources`, `/scan`) and dashboard app shell (for SEO fallbacks and social previews on marketing-origin links).
- **Tools:** Manual meta inspection, `npx lighthouse --only-categories=seo`, [Open Graph Debugger](https://www.opengraph.xyz/), [Twitter Card Validator](https://cards-dev.twitter.com/validator), `npm run lint:structured-data` (JSON-LD validator script).

## Metadata Checklist
- ✅ Title + meta description present on all marketing routes (Angular route data wired into `Meta` service).
- ✅ Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`) set; default image: `https://cdn.A11yAssistant.com/og/hero.png`.
- ✅ Twitter Card tags (`summary_large_image`) mirror OG content.
- ✅ Canonical links configured per route to avoid duplicate content.
- ✅ JSON-LD `Organization` + `WebSite` schema present on home and scan pages.

## Commands / Validation
```bash
npx lighthouse http://localhost:4200 --only-categories=seo --preset=desktop --output=json --output-path=./docs/reports/launch-2025-11-17/marketing-seo-lighthouse.json
npm run lint:structured-data -- --url http://localhost:4200/
```
- Lighthouse SEO score: **100/100** (desktop) – zero failing audits.
- JSON-LD validator: no errors; recognized `Organization` with contact email `support@aaca.test`.
- Open Graph Debugger & Twitter Card Validator both render preview with headline "AI-powered accessibility compliance for small websites" and hero image.

## Screenshots / Evidence
- Structured data and preview screenshots stored in `docs/reports/launch-2025-11-17/seo-previews/` (see `og-home.png`, `twitter-home.png`).
- Lighthouse JSON saved alongside this doc (`marketing-seo-lighthouse.json`).

## Follow-ups
- Swap `cdn.aaca.com/og/hero.png` to production CDN path during cutover; current image hosted in staging bucket.
- Add article schema when blog resources launch.
