# Local Infrastructure

Docker Compose stack to run the monorepo locally: PostgreSQL, Spring Boot API, scanner, AI orchestrator placeholder, and both Angular frontends served via Nginx.

## Prerequisites
- Docker Engine + Docker Compose plugin installed locally.
- Copy `.env.sample` to `.env` (or create `.env.local` and pass `--env-file .env.local`) to set ports and credentials. The compose file references `.env` explicitly, so a file must be present.

## Bring the stack up
```bash
npm run docker:up:build
```
- Services come up on the ports defined in `.env` (API: 8080, scanner: 4001, AI orchestrator: 4002, marketing site: 4200, dashboard: 4300).
- Inside the compose network, other services should call the API at `http://api:8080`.
- The API calls `http://scanner:4001/scan` and `http://ai-orchestrator:4002/suggest-fixes` by default; override `SCANNER_SERVICE_URL` or `AI_ORCHESTRATOR_SERVICE_URL` in `.env` when running the API outside of Compose.

### Rebuild or stop
- Rebuild images without cache: `npm run docker:rebuild`
- Follow logs: `npm run docker:logs`
- Tear down: `npm run docker:down`

## Validation notes
- Intended validation: `docker compose up --build --abort-on-container-exit` after copying `.env.sample` to `.env`.
- Current environment limitation: Docker is not available in this execution sandbox (`docker compose` not found), so the command cannot be run here. Run the command on a Docker-enabled machine to verify image builds and container startup.

### Build details
- The API image uses the Gradle wrapper inside `services/api` with a staged copy to cache dependencies.
- Node services (scanner, AI orchestrator) build via `nx build ... --configuration=production`, then prune lockfiles and copy workspace modules before installing only production dependencies in the final stage.

## Troubleshooting
- **Port already in use:** Update the port values in `.env` and rerun `npm run docker:up:build`.
- **Gradle download slowness:** The API image uses the official Gradle image; ensure network access or prewarm caches if builds are slow.
- **Node memory spikes during Angular builds:** Increase Docker memory or set `NODE_OPTIONS=--max-old-space-size=4096` in your environment before starting the stack.
- **Frontends cannot reach the API:** Confirm `API_INTERNAL_URL`/`PUBLIC_API_BASE_URL` in `.env` point to `http://api:8080` (internal) and `http://localhost:8080` (host) respectively.

## Production / Staging Configuration Checklist

| Area | Staging | Production | Notes |
| --- | --- | --- | --- |
| Hostnames | `staging.api.aaca.test`, `staging.scanner.aaca.test`, `staging.ai.aaca.test`, `staging.aaca.test` (marketing), `staging.app.aaca.test` (dashboard) | `api.A11yAssistant.com`, `scanner.A11yAssistant.com`, `ai.A11yAssistant.com`, `www.A11yAssistant.com`, `app.A11yAssistant.com` | DNS + TLS managed via Cloudflare; certificates auto-provisioned. |
| Secrets | `JWT_SECRET`, `POSTGRES_PASSWORD`, `EMBED_SIGNING_KEY`, `AI_API_KEY` stored in secrets manager; mounted as env vars | same as staging with prod values | Keep secrets out of `.env.*`; rotation handled quarterly. |
| Database | `POSTGRES_HOST=staging-db`, `POSTGRES_DB=aaca_staging` | `POSTGRES_HOST=prod-db`, `POSTGRES_DB=aaca_prod` | Apply Flyway migrations on startup (already enabled). |
| API config | `PUBLIC_API_BASE_URL=https://staging.api.aaca.test/api/v1`, `SECURITY_PUBLIC_SCAN_RATE_LIMIT=5` | `PUBLIC_API_BASE_URL=https://api.A11yAssistant.com/api/v1`, `SECURITY_PUBLIC_SCAN_RATE_LIMIT=5` | Rate limit matched to MVP spec. |
| Frontend env | `NG_APP_API_URL=https://staging.api.aaca.test/api/v1`, `NG_APP_EMBED_CDN=https://cdn-staging.A11yAssistant.com` | `NG_APP_API_URL=https://api.A11yAssistant.com/api/v1`, `NG_APP_EMBED_CDN=https://cdn.A11yAssistant.com` | Values injected via Angular environment files or `.env.production.local`. |
| Scanner | `SCANNER_ORIGIN=https://staging.scanner.aaca.test`, `CHROME_PATH=/usr/bin/chromium` | `SCANNER_ORIGIN=https://scanner.A11yAssistant.com`, `CHROME_PATH=/usr/bin/chromium` | Ensure sandbox flags set per Dockerfile. |
| Observability | `PROMETHEUS_PUSHGATEWAY_URL` pointing to staging gateway; Grafana URL `https://grafana-staging.aaca.test` | `PROMETHEUS_PUSHGATEWAY_URL` pointing to prod gateway; Grafana URL `https://grafana.A11yAssistant.com` | Dashboards `a11y-overview`, `scan-pipeline` enabled in both. |
| Support | `SUPPORT_EMAIL=support@aaca.test`, `STATUS_PAGE_URL=https://status.aaca.test` | `SUPPORT_EMAIL=support@A11yAssistant.com`, `STATUS_PAGE_URL=https://status.A11yAssistant.com` | Marketing footer links driven by these values. |

### Verification Steps
- Copy `.env.sample` to `.env.staging` and `.env.production`, then populate values above.
- Run `npm run ci:config:check -- --env-file .env.staging` to validate required vars are present (script in `tools/` checks for missing keys).
- Dry-run deploy: `docker compose -f docker-compose.yml --env-file .env.staging config` to ensure substitutions resolve.
- After deploy, confirm health endpoints respond (see Observability section) and that marketing footer shows correct support email.

## Observability (Section 11)
- **Structured logging**
  - API emits JSON logs via Logstash encoder (fields include `service`, `correlationId`, `requestPath`).
  - Scanner and AI orchestrator use Pino JSON with `service` + `correlationId` derived from the `X-Request-Id` header (auto-generated if missing).
  - Tail all containers: `npm run docker:logs` (or `docker compose logs -f api scanner ai-orchestrator`).

- **Health endpoints** (exposed on main service ports for local uptime monitors / compose healthchecks):
  - API: `http://localhost:${API_PORT:-8080}/health`
  - Scanner: `http://localhost:${SCANNER_PORT:-4001}/health`
  - AI orchestrator: `http://localhost:${AI_ORCHESTRATOR_PORT:-4002}/health`

- **Metrics**
  - API (Micrometer/Prometheus): `http://localhost:${API_PORT:-8080}/prometheus` (includes scan counters and timers).
  - Scanner (prom-client): `http://localhost:${SCANNER_PORT:-4001}/metrics` (scan totals + duration histogram).
  - AI orchestrator (prom-client): `http://localhost:${AI_ORCHESTRATOR_PORT:-4002}/metrics` (AI suggestion counts + issue distribution).
  - Compose exposes these on the same service ports; point Prometheus/Grafana at the host URLs above or the in-network names `api:8080/prometheus`, `scanner:4001/metrics`, `ai-orchestrator:4002/metrics`.

- **Quick checks**
  - `curl -s http://localhost:8080/health` → Spring Boot health JSON.
  - `curl -s http://localhost:4001/metrics | head` to verify scanner metrics scrape.
  - `curl -s http://localhost:4002/metrics | head` to verify AI orchestrator metrics.
