# Scanner Contributor Guide

## Scope And Mission

This guide applies only to `services/scanner/**`.

`services/scanner` is the AACA accessibility scanning service. It runs Fastify + Playwright + axe-core and exposes deterministic, machine-readable findings through `POST /scan` for downstream API workflows.

The scanner is an upstream dependency of `services/api`. Keep behavior stable, resilient, and contract-driven.

## Service Boundaries

- Scanner owns page rendering and rule-based accessibility detection.
- Scanner returns normalized issues only; business scoring, persistence, and user-facing composition happen in `services/api`.
- Scanner must not introduce demo/mock fallback behavior.

Current endpoints:
- `POST /scan`
- `GET /health`
- `GET /metrics`

## Runtime Configuration (Source Of Truth: `src/config.ts`)

Environment variables and defaults:

- `SCANNER_ENV_FILE` optional dotenv file path.
- `PORT` default `4100`.
- `HOST` default `0.0.0.0`.
- `SCANNER_TIMEOUT_MS` default `30000`.
- `SCANNER_VIEWPORT_WIDTH` default `1280`.
- `SCANNER_VIEWPORT_HEIGHT` default `720`.
- `SCANNER_MAX_RETRIES` default `1`.
- `SCANNER_USER_AGENT` default `AACA-Scanner/1.0 (Playwright; +https://a11y.example.com)`.
- `SCANNER_API_BASE_URL` default `http://localhost:8080`.

Keep config names aligned with `src/config.ts`. Do not introduce alternate env names without coordinated updates.

## Input/Output Contract

### `POST /scan`

Request body expectations:

- `url` required string.
- `htmlSnapshot` optional string.
- `waitUntil` optional one of: `load`, `domcontentloaded`, `networkidle`, `commit`.

Validation rules:

- URL must be sanitized with `sanitizeScanUrl` from `@aiaca/domain`.
- Invalid payloads must return `400` with machine-readable error body.

Success response shape:

```json
{
  "url": "https://example.com/path",
  "issues": [
    {
      "id": "image-alt-1",
      "type": "alt_missing",
      "severity": "error",
      "selector": "img.hero",
      "description": "Add alt text",
      "helpUrl": "https://..."
    }
  ],
  "meta": {
    "issueCount": 1,
    "rawDurationMs": 742
  }
}
```

Issue schema expectations:

- `id`: deterministic per violation/node (`<axeRuleId>-<index>`).
- `type`: one of:
  - `alt_missing`
  - `contrast`
  - `heading_structure`
  - `form_label`
  - `link_semantics`
  - `button_semantics`
  - `keyboard_focusability`
- `severity`: `error` or `warning`.
- `selector`: CSS-like selector string, fallback `unknown` when target is unavailable.
- `description`: human-readable rule/help text.
- `helpUrl`: optional reference URL from axe.

Error response expectations:

- `400` for invalid URL/payload.
- `500` for scan execution failures.
- Bodies should remain stable JSON objects with `error` and optional `details`.

### `GET /health`

Returns scanner liveness data with `status` and uptime.

### `GET /metrics`

Prometheus metrics endpoint. Keep metric names stable unless a migration plan is provided:

- `scanner_scans_total`
- `scanner_scan_duration_seconds`

## Determinism And Machine-Readability Guardrails

- Preserve normalized output shape consumed by `services/api/src/main/java/com/aiaca/api/client/ScannerClient.java`.
- Keep `RULE_TYPE_MAP`-based normalization deterministic and explicit.
- Avoid non-deterministic fields in `issues` (timestamps/random IDs/request-specific noise).
- Continue disabling animations during scans to reduce timing variance.
- If unsupported axe rules are encountered, ignore them unless intentionally mapped.

## Reliability And Performance Guardrails

- Respect `SCANNER_TIMEOUT_MS` for page and navigation timeouts.
- Keep retries bounded and config-driven (`SCANNER_MAX_RETRIES`); never introduce unbounded retry loops.
- Always close browser resources on every path (`finally` blocks required).
- Do not leak Chromium/page/context processes across requests.
- Keep launch options compatible with containers (`--disable-dev-shm-usage`, `--no-sandbox`) unless a tested replacement is provided.
- Keep `/health` and `/metrics` low-latency and independent from scan execution.

## Privacy And Security Guardrails

- Never bypass `sanitizeScanUrl`.
- Keep redaction in `src/scan/redaction.ts` so HTML snippets are removed from axe nodes/checks.
- Do not return raw `htmlSnapshot`, page HTML, or other sensitive DOM content in API responses.
- Do not log full HTML snapshots, secrets, or sensitive page content.
- Maintain correlation IDs (`x-request-id`) for traceability without exposing user data.

## Docker And Runtime Constraints

Containerized scanning is the production path. Do not break it.

- Preserve Chromium dependency installation in `services/scanner/Dockerfile`:
  - `npx playwright install-deps chromium`
  - `npx playwright install chromium`
- Keep runtime base image compatible with Playwright Chromium deps.
- Validate that any browser flags/runtime changes still work in Docker before merging.

## Local Build/Test/Run Commands

Run from repository root.

Install dependencies:

```bash
npm install
```

Run scanner in dev mode:

```bash
SCANNER_ENV_FILE=services/scanner/.env npm run nx -- run scanner:serve
```

Build scanner:

```bash
npm run build -- --projects=scanner --configuration=production
```

Test scanner:

```bash
npm run test -- --projects=scanner
```

Run a quick sample scan script:

```bash
npm run scanner:sample -- https://example.com
```

Run scanner in Docker (recommended integration path):

```bash
docker compose up --build scanner
```

## PR Checklist

### For Any Scanner PR

- [ ] Endpoints `/scan`, `/health`, and `/metrics` remain functional.
- [ ] URL validation still uses `sanitizeScanUrl` from `@aiaca/domain`.
- [ ] Data minimization preserved (no sensitive HTML in returned payloads/logs).
- [ ] Timeouts/headless lifecycle are safe (no leaked browser resources).
- [ ] Scanner tests pass (`npm run test -- --projects=scanner`).
- [ ] Docker scanner flow still runs (`docker compose up --build scanner`).

### Additional Checks: Scan-Rule Changes

- [ ] `src/scan/axe-normalizer.ts` mapping changes are intentional and documented.
- [ ] `src/scan/axe-normalizer.spec.ts` updated with expected normalized output.
- [ ] Severity mapping changes are backward-compatible or explicitly coordinated.
- [ ] Rule coverage changes do not introduce non-deterministic issue IDs.

### Additional Checks: Output-Shape Changes

- [ ] `services/api/src/main/java/com/aiaca/api/client/ScannerClient.java` updated if response schema changed.
- [ ] API integration/contract tests updated for scanner response compatibility.
- [ ] Breaking changes are versioned or coordinated across scanner + API in one release window.
- [ ] `/metrics` name/label changes include migration notes for observability dashboards.
