# AGENTS.md - `services/api` (AACA Backend)

## Scope & Mission
This folder owns the AACA primary REST backend built with Spring Boot (Java 21).  
It serves versioned APIs under `/api/v1` for:
- Auth/session
- Sites and scan lifecycle
- Embed configuration
- Billing (`/api/v1/billing/**`)

Billing endpoints are in active development and currently power both `apps/dashboard` and `apps/payments-admin`.

## Responsibilities
- Provide stable, versioned REST contracts for frontend consumers.
- Persist and query domain data (users, sites, scans, issues, suggestions, billing entities).
- Orchestrate downstream scanner and AI suggestion services.
- Enforce authn/authz, subscription checks, rate limits, validation, and error contracts.
- Maintain schema evolution via SQL migrations in `src/main/resources/db/migration`.

## Non-Responsibilities
- Scanner rule execution internals (`services/scanner/**`).
- LLM prompt/vision orchestration internals (`services/ai-orchestrator/**`).
- Frontend UX/state management (`apps/**`).
- Embed runtime behavior implementation (`packages/embed-script/**`).

## Key Paths
- Controllers: `src/main/java/com/aiaca/api/controller`
- Core services: `src/main/java/com/aiaca/api/service`
- Billing services: `src/main/java/com/aiaca/api/service/billing`
- Downstream clients: `src/main/java/com/aiaca/api/client`
- Persistence repositories: `src/main/java/com/aiaca/api/repository`
- Billing repositories: `src/main/java/com/aiaca/api/repository/billing`
- Security/JWT/subscription guards: `src/main/java/com/aiaca/api/security`
- Request/infra config (including correlation IDs + WebClient): `src/main/java/com/aiaca/api/config`
- DTO contracts: `src/main/java/com/aiaca/api/dto`
- JPA entities: `src/main/java/com/aiaca/api/model`
- Flyway migrations: `src/main/resources/db/migration`
- Local seed migrations: `src/main/resources/db/seed/local`
- App config profiles: `src/main/resources/application*.properties`
- Integration/unit tests: `src/test/java`

## Runtime & Data Profiles
- Default local/test datastore: H2 (in-memory).
- Local/prod profile target datastore: PostgreSQL.
- Migration strategy: Flyway SQL migrations are the schema source of truth.

Primary environment knobs:
- `SPRING_PROFILES_ACTIVE` (`local` for Postgres-backed local run)
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- `SPRING_FLYWAY_ENABLED`
- `SCANNER_SERVICE_URL` (default `http://scanner:4001/scan`)
- `AI_ORCHESTRATOR_SERVICE_URL` (default `http://ai-orchestrator:4002/suggest-fixes`)
- `EXTERNAL_HTTP_TIMEOUT_MS` (default `8000`)

## Local Workflow Commands
Run from `services/api` unless noted otherwise.

### Build, Run, Test (`./gradlew`)
- Run API with default profile (H2): `./gradlew bootRun`
- Run API with local Postgres profile: `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun`
- Run tests: `./gradlew test`
- Clean + test: `./gradlew clean test`
- Build jar: `./gradlew bootJar`

### Migration Workflow
- Add migration: `src/main/resources/db/migration/V{next}__short_description.sql`
- Optional local seed-only migration: `src/main/resources/db/seed/local/V{next}__short_description.sql`
- Validate migration changes:
  - `./gradlew test` (fast H2/test regression)
  - `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun` (Postgres profile verification)

### Docker / Monorepo Orchestration (run from repo root)
- Start full stack: `npm run docker:up:build`
- Stream logs: `npm run docker:logs`
- Stop stack: `npm run docker:down`
- API-focused compose run: `docker compose up -d postgres api scanner ai-orchestrator`

## Contract Rules

### Frontend-Facing API Contracts
- Keep `/api/v1` backward compatible; prefer additive fields over breaking removals/renames.
- Preserve error envelope format from `GlobalExceptionHandler`:
  - `code`, `message`, optional `errors` map
- Protected endpoints require JWT bearer auth unless explicitly public.
- `GET /api/v1/sites/{id}/embed-config` supports either:
  - `X-Embed-Key` for embed-script access, or
  - Authenticated owner access
- Billing contracts under `/api/v1/billing/**` must be treated as consumed APIs for dashboard + payments-admin even while evolving.

### Downstream Service Contracts
- Scanner call:
  - `POST {SCANNER_SERVICE_URL}` with body `{ "url": "<sanitized-url>" }`
  - Default URL: `http://scanner:4001/scan`
- AI orchestrator call:
  - `POST {AI_ORCHESTRATOR_SERVICE_URL}` with body `{ pageUrl, issues, useStub }`
  - Default URL: `http://ai-orchestrator:4002/suggest-fixes`
- Correlation IDs:
  - Inbound request ID header: `X-Request-Id`
  - Must be propagated to scanner and ai-orchestrator calls
  - If absent, generate one and return it in API response headers
- Timeouts and upstream failures:
  - Use shared WebClient timeout via `EXTERNAL_HTTP_TIMEOUT_MS`
  - Map upstream non-2xx/timeouts/network failures to controlled API errors (typically 502)
  - Do not leak stack traces or sensitive payloads in responses/logs

## Security & Data Guardrails
Baseline source: `docs/security-privacy.md`

- Public scan abuse control:
  - Enforce IP-based rate limiting on `POST /api/v1/public/scans`
  - Defaults: 5 requests per minute (`security.public-scan.rate-limit.*`)
- URL sanitization:
  - Accept only `http`/`https`
  - Require hostname
  - Strip URL fragments before downstream scan calls
- Data minimization/redaction:
  - Do not persist raw page HTML or form/user content unless a formally approved requirement is added
  - Keep logs focused on IDs/hosts; avoid full user-provided payloads
- Secrets and credentials:
  - Never commit secrets; use env variables/secret manager
  - Preserve JWT/password handling patterns (BCrypt, short-lived tokens, no plaintext storage)

## PR Checklist (Schema/API Changes)
For any DB schema, DTO, endpoint, or downstream contract change:

1. Schema and migrations
- Added/updated Flyway migration in `src/main/resources/db/migration`
- Included indexes/constraints needed for new queries and integrity
- Documented any data backfill or rollout ordering requirements

2. API contract impacts
- Updated controller/service/DTO mappings consistently
- Preserved backward compatibility for `/api/v1` or documented breaking change with migration plan
- Validated error codes and response shape consistency
- Explicitly reviewed billing changes for dashboard + payments-admin impact

3. Downstream integration reliability
- Kept `X-Request-Id` propagation end-to-end
- Added/updated timeout/error handling for scanner/ai-orchestrator paths
- Confirmed behavior for downstream partial failure (for example, scanner hard-fail vs AI suggestion soft-fail)

4. Security/privacy
- Confirmed public scan limits and URL sanitization still enforced
- Confirmed no new PII/raw-content persistence or sensitive logging
- Reviewed new config/env vars for secret handling and safe defaults

5. Verification
- Ran: `./gradlew test`
- Smoke-tested critical flows locally (auth, site CRUD, scan execution, embed-config, billing path touched)
- If Postgres-affecting change: validated with `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun` (or compose-backed equivalent)
