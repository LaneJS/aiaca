# AI Orchestrator Contributor Guide

## Scope And Mission

This guide applies only to `services/ai-orchestrator`.

`ai-orchestrator` is AACA's suggestion engine. It receives normalized accessibility issues and returns structured fix suggestions for callers.

Owned HTTP surface:
- `POST /suggest-fixes`
- `GET /health`
- `GET /metrics`

Service boundary:
- Caller is `services/api` (or another trusted backend service).
- This service does not own persistence, business authentication/authorization, billing decisions, or tenant/business policy storage.

## Provider Architecture And Fallback Expectations

Current architecture:
- Fastify entrypoint in `src/app/server.ts`.
- Provider abstraction via `SuggestionProvider` in `src/providers/types.ts`.
- Primary provider: `GeminiSuggestionProvider`.
- Fallback provider: `StubSuggestionProvider`.
- Orchestration and limits in `src/app/suggestion-service.ts`.

Rules for provider work:
- Keep all providers behind the `SuggestionProvider` interface.
- Gemini integration must use the official `@google/genai` SDK.
- Keep model selection config-driven via `@aiaca/config` (`GEMINI_MODEL`), with default `gemini-2.0-flash-exp`.
- Keep structured generation enabled (`responseMimeType: application/json` + response schema).
- Preserve fallback behavior:
  - Force stub when `AI_ORCHESTRATOR_USE_STUB=true` or `GEMINI_API_KEY` is missing.
  - Respect per-request `useStub=true`.
  - On primary provider error/timeout, return validated stub output instead of unstructured failure payloads.

## Contract Rules (Input Validation And Output Stability)

Input contract:
- Validate every `POST /suggest-fixes` body with shared `aiSuggestFixRequestSchema` from `@aiaca/domain`.
- Return `400` for invalid payloads; do not accept ad hoc fields silently.
- Enforce `AI_ORCHESTRATOR_MAX_ISSUES` before provider calls.

Output contract:
- Provider output must validate against shared `aiSuggestFixResponseSchema`.
- Keep response shape stable:
  - `provider`
  - `requestId`
  - `suggestions[]`
  - `usage` (optional)
- Keep suggestions grounded to request context:
  - do not emit unknown selectors/issue IDs
  - do not return `altText` for non-image issues
- Do not change response field names/types without coordinated changes in `@aiaca/domain` and callers.

## Security And Privacy Guardrails

- Treat `domSnapshot`, `htmlSnippet`, and page content as sensitive input.
- Avoid logging raw request bodies, DOM snapshots, or full page HTML.
- Keep logs metadata-focused (request IDs, provider name, issue counts, timing, error class).
- Validate and filter provider responses before returning them to callers.
- Keep this service stateless for business data; do not add persistence here.

## Env And Config Checklist

All runtime config must load through `loadEnv(orchestratorEnvSchema)` from `@aiaca/config`.

Core variables:
- `AI_ORCHESTRATOR_PORT` (default `4002`)
- `AI_ORCHESTRATOR_USE_STUB` (`true`/`1` forces stub mode)
- `AI_ORCHESTRATOR_MAX_ISSUES` (default `5`)
- `AI_ORCHESTRATOR_TIMEOUT_MS` (default `20000`)
- `AI_ORCHESTRATOR_TENANT_BUDGET_TOKENS` (optional per-tenant token ceiling)
- `GEMINI_API_KEY` (required for live Gemini calls)
- `GEMINI_MODEL` (default `gemini-2.0-flash-exp`)
- `GEMINI_LOCATION` (present in shared schema; keep compatibility)
- `LOG_LEVEL` (pino log verbosity)

Budgeting/timeout behavior to preserve:
- Timeout applies to provider execution and triggers fallback.
- `AI_ORCHESTRATOR_MAX_ISSUES` caps provider workload.
- Tenant budget checks apply when `tenantId` is provided.
- Budget-exceeded requests fail explicitly; do not silently bypass limits.

## Local Build, Test, Run

Run from repo root:

```bash
npm install
```

Development server:

```bash
npm run nx -- run ai-orchestrator:serve --configuration=development
```

Tests:

```bash
npm run nx -- run ai-orchestrator:test
```

Production build:

```bash
npm run nx -- run ai-orchestrator:build --configuration=production
```

Run built artifact:

```bash
node dist/services/ai-orchestrator/main.js
```

Docker path:

```bash
docker compose up --build ai-orchestrator
```

Smoke checks:

```bash
curl -s http://localhost:4002/health
curl -s http://localhost:4002/metrics
```

## PR Checklist (Prompt, Provider, Schema Changes)

- [ ] Scope respected: no persistence/business-auth logic added to this service.
- [ ] `POST /suggest-fixes`, `/health`, and `/metrics` behavior remains stable or breaking changes are explicitly documented.
- [ ] Input validation still uses shared `aiSuggestFixRequestSchema` from `@aiaca/domain`.
- [ ] Output still validates against shared `aiSuggestFixResponseSchema` and remains strictly structured.
- [ ] Gemini path still uses official `@google/genai`.
- [ ] Model is still sourced from config; default remains `gemini-2.0-flash-exp` unless intentionally changed across config + docs.
- [ ] Fallback mode verified for:
  - forced stub env (`AI_ORCHESTRATOR_USE_STUB=true`)
  - missing `GEMINI_API_KEY`
  - provider timeout/error
- [ ] Limits verified: max issues, timeout, tenant token budget behavior.
- [ ] Logging reviewed for sensitive-content leakage.
- [ ] Tests updated/added for changed prompt/provider/validator behavior.
- [ ] Commands run successfully:
  - `npm run nx -- run ai-orchestrator:test`
  - `npm run nx -- run ai-orchestrator:build --configuration=production`
