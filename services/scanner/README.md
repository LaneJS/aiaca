# Scanner Service (Node/TypeScript)

Headless accessibility scanner built with Playwright and axe-core. Exposes an internal `/scan` API that accepts a URL (and optional HTML snapshot) and returns normalized accessibility issues shared with `services/api`.

## Project layout
- `src/server.ts` – Fastify server exposing `/scan` and `/health`.
- `src/scan/playwright-scanner.ts` – Deterministic Playwright runner that injects axe-core and normalizes results.
- `src/scan/axe-normalizer.ts` – Maps axe-core rule IDs to the scanner issue model.
- `src/types/scan.ts` – Shared DTOs for services/api or other consumers.
- `src/client/scanner-client.ts` – Lightweight HTTP client for other services.
- `src/scripts/sample-scan.ts` – Run a quick scan from the CLI.

## Setup
1. Install dependencies at the repo root:
   ```bash
   npm install
   npx playwright install chromium
   # If headless Chrome fails to launch on your OS, also install dependencies:
   npx playwright install-deps chromium
   ```
2. Copy environment defaults if needed:
   ```bash
   cp services/scanner/.env.sample services/scanner/.env
   ```

## Commands
- Development server: `npx nx serve scanner`
- Build: `npx nx build scanner`
- Tests: `npx nx test scanner`
- Sample scan (CLI without HTTP server):
  ```bash
  npm run scanner:sample -- https://example.com
  ```

## API contract
`POST /scan`
```json
{
  "url": "https://example.com",
  "htmlSnapshot": "<html>...optional pre-rendered HTML...</html>"
}
```
Response:
```json
{
  "url": "https://example.com",
  "issues": [
    {
      "id": "image-alt-1",
      "type": "alt_missing",
      "severity": "error",
      "selector": "img.hero",
      "description": "Add alt text"
    }
  ],
  "meta": {
    "issueCount": 1,
    "rawDurationMs": 1200
  }
}
```

### Issue types covered
- Missing alt text (`image-alt`, `area-alt`)
- Contrast (`color-contrast`)
- Heading structure (`heading-order`, `page-has-heading-one`)
- Form labels/ARIA (`label`, `aria-label`, `form-field-multiple-labels`, `aria-allowed-attr`)
- Link semantics (`link-name`)
- Button semantics (`button-name`)
- Keyboard focusability (`aria-input-field-name`)

## Deterministic scanning behavior
- Fixed viewport `1280x720` and user agent `AACA-Scanner/1.0 (Playwright; +https://a11y.example.com)`.
- Animations disabled via injected CSS.
- `networkidle` waits for SPA rendering; configurable timeout via `SCANNER_TIMEOUT_MS`.
- Headless Chromium launched per scan (documented in `.env.sample`).

## Integration with `services/api`
- Internal consumers can import `ScanRequestBody`/`NormalizedIssue` from `src/types/scan.ts` and call the service through `createScannerClient`.
- Default base URL: `http://localhost:4100` (override with `SCANNER_API_BASE_URL`).
- Future persistence/queueing can live behind the client without changing the server contract.

## Development notes
- For environments without headless browsers, mock `PlaywrightScanner` behind the same interface and return canned issues.
- Graceful shutdown handles `SIGINT`/`SIGTERM` and closes Fastify.
- Concurrency defaults to one scan per process; scale via multiple instances or external queueing.

## Debugging failed scans
- Set `LOG_LEVEL=debug` to see navigation and axe run details.
- Use the sample script with `DEBUG=pw:api` to inspect Playwright steps.
- Validate URLs resolve locally; timeouts default to 30s and are configurable.

## Sample output
Running `npm run scanner:sample -- "data:text/html,<html><body><img src='x'><button></button></body></html>"` prints a JSON list of normalized issues. Example:
```json
[
  {
    "id": "button-name-1",
    "type": "button_semantics",
    "severity": "error",
    "selector": "button",
    "description": "Buttons must have discernible text"
  },
  {
    "id": "image-alt-1",
    "type": "alt_missing",
    "severity": "error",
    "selector": "img",
    "description": "Images must have alternative text"
  },
  {
    "id": "page-has-heading-one-1",
    "type": "heading_structure",
    "severity": "warning",
    "selector": "html",
    "description": "Page should contain a level-one heading"
  }
]
```
