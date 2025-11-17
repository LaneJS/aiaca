# Security, Privacy & Compliance (MVP)

This repository implements the Section 12 controls from `todos.md`.

## Controls
- **Public scan rate limiting:** `POST /api/v1/public/scans` is capped at 5 requests per IP per minute by default. Configure with `security.public-scan.rate-limit.max-requests` and `security.public-scan.rate-limit.window-ms` in the API.
- **URL validation:** A shared `sanitizeScanUrl` helper in `@aiaca/domain` enforces http/https and strips fragments. The API and scanner both apply this before executing scans.
- **Data minimization:** Scanner redacts HTML snippets from axe-core results (`redactAxeResults`) and only returns selectors/metadata. API models avoid persisting raw HTML context by default.
- **Retention posture:** Public scan metadata is retained for 30 days for abuse detection; page contents are discarded after analysis. Authenticated scan summaries persist for customer history; raw HTML is not stored unless explicitly enabled in a future opt-in setting.
- **Cookie policy:** Marketing site does not set non-essential cookies or tracking pixels, so a consent banner is not rendered. If analytics are added, enable a CMP and update `docs/legal/cookie-banner-decision.md`.

## Secrets & least privilege
- Scanner/API use environment variables for credentials; never commit secrets. Provide least-privilege API keys per service via `.env`/secret manager.
- Logs and metrics should omit user-provided content; prefer identifiers/hosts over full URLs.

## Next steps
- Legal review of the placeholder Privacy Policy and Terms in `docs/legal/`.
- Revisit retention timelines with counsel before production launch.
