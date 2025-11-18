# Embed Script Package

Lightweight, dependency-free JavaScript bundle that applies AACA auto-fix enhancements on customer sites.

## CDN Usage

Add the script near the top of your `<body>`:

```html
<script
  src="https://cdn.A11yAssistant.com/autofix.js"
  data-site-id="YOUR_SITE_ID"
  data-embed-key="EMBED_KEY_FROM_API"
  data-api-base="https://api.A11yAssistant.com/api/v1"
></script>
```

**Data attributes**
- `data-site-id` (**required**) – site identifier returned by `POST /api/v1/sites`.
- `data-embed-key` (recommended) – forwarded as `X-Embed-Key` to `GET /api/v1/sites/{id}/embed-config`.
- `data-api-base` (optional) – defaults to `/api/v1`; useful if your site is served from a different domain than the API.
- `data-skip-link-text` (optional) – override the skip link label.
- `data-focus-outline-color` (optional) – override outline color, e.g. `#ff6b6b`.
- `data-disable-alt-text`, `data-disable-skip-link`, `data-disable-focus-outline` (optional) – set to `true` to disable a fix.

The script automatically fetches the embed config and runs fixes on load. If the API is unreachable the script logs a warning and safely no-ops.

## Features (MVP)
- Apply AI-provided alt text suggestions to images missing `alt` attributes.
- Inject a “Skip to main content” link when one is missing.
- Ensure focus outlines remain visible with a small CSS patch.
- Feature toggles via backend config (`autoFixes`, `enableSkipLink`) and/or data attributes.

## Development

- Install deps: `npm install`
- Run unit tests: `npm run test`
- Build CDN bundle with size report: `npm run build`
- Generated bundle: `packages/embed-script/dist/autofix.js` (IIFE, global `AACAEmbed`, sourcemap included)

### Manual testing

Use the sample HTML page `packages/embed-script/docs/demo.html`:

```bash
npx http-server packages/embed-script/docs -p 8080
```

Then load http://localhost:8080/demo.html in a browser. The demo page renders images without alt text and no skip link; the embed script injects alt text, a skip link, and focus outlines. Open devtools console to see network logs.

## Troubleshooting
- **No fixes applied**: Verify `data-site-id` is present and network tab shows a 200 for `/sites/{id}/embed-config`.
- **CORS errors**: Set `data-api-base` to the fully qualified API domain and ensure `X-Embed-Key` is allowed by the backend.
- **Existing skip link**: If your page already has a skip link the script leaves it unchanged.
- **Privacy**: The script only calls the embed config endpoint and does not collect user analytics.
