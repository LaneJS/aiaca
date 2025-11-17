# AI Orchestrator Service (Node/TypeScript)

Fastify microservice that turns scanner issues + DOM snippets into structured AI suggestions. Providers include Gemini (Vertex AI) and a deterministic stub for offline development.

## Architecture
- **Entry point:** `src/main.ts` boots a Fastify server and registers `POST /suggest-fixes` via `src/app/routes.ts`.
- **Configuration:** Environment variables validated through `@aiaca/config` in `src/app/config.ts`.
- **Providers:**
  - `GeminiSuggestionProvider` (`src/providers/gemini-provider.ts`) for live calls to Gemini 2.5 Pro using structured JSON output.
  - `StubSuggestionProvider` (`src/providers/stub-provider.ts`) to mimic API responses when offline or when `AI_ORCHESTRATOR_USE_STUB=true`.
- **Prompting & validation:** Prompt builder in `src/prompt/prompt-builder.ts`; AI responses validated and grounded against incoming selectors/snippets in `src/prompt/response-validator.ts`.
- **Budgeting & resiliency:** `SuggestionService` enforces per-request issue caps, optional tenant token budgets, timeouts, and falls back to the stub provider on errors.

## Environment
Set the following variables (see `.env.sample` for patterns):

| Variable | Purpose | Default |
| --- | --- | --- |
| `AI_ORCHESTRATOR_PORT` | Port to bind Fastify | `4002` |
| `AI_ORCHESTRATOR_USE_STUB` | Force stub provider even if Gemini is configured | `false` |
| `AI_ORCHESTRATOR_MAX_ISSUES` | Max issues per request to guard token use | `5` |
| `AI_ORCHESTRATOR_TIMEOUT_MS` | Request timeout to AI provider | `20000` |
| `AI_ORCHESTRATOR_TENANT_BUDGET_TOKENS` | Optional per-tenant budget (in tokens) | _unset_ |
| `GEMINI_API_KEY` | API key for Gemini / Vertex AI | _required for live calls_ |
| `GEMINI_MODEL` | Model name | `gemini-1.5-pro` |

## Running locally

```bash
# Install workspace dependencies
npm install

# Start the orchestrator (stubbed if GEMINI_API_KEY is missing)
npx nx serve ai-orchestrator

# Run tests
npx nx test ai-orchestrator
```

### Sample request (POST /suggest-fixes)

```json
{
  "tenantId": "demo-tenant",
  "domSnapshot": "<main><img class=\"hero\" src=\"/hero.jpg\"></main>",
  "issues": [
    {
      "id": "issue-1",
      "type": "alt_missing",
      "severity": "MODERATE",
      "description": "Image missing alt text",
      "selector": "img.hero",
      "htmlSnippet": "<img class=\"hero\" src=\"/hero.jpg\">"
    }
  ]
}
```

### Sample stub response

```json
{
  "provider": "stub",
  "requestId": "<uuid>",
  "suggestions": [
    {
      "issueId": "issue-1",
      "selector": "img.hero",
      "explanation": "Images need concise alt text so screen readers can describe them.",
      "suggestedFix": "Add an alt attribute to img.hero with a short description.",
      "altText": "Descriptive image alt text",
      "confidence": 0.42,
      "grounded": true
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 }
}
```

## Notes on Gemini usage
- Uses structured JSON via `responseSchema` to match the DTOs in `@aiaca/domain`.
- Token usage from Gemini is surfaced in responses; per-tenant budgets are enforced in-memory for now.
- If Gemini credentials are missing or a timeout/error occurs, the stub provider responds with safe defaults to keep the API stable.

## Deployment considerations
- Bind to `0.0.0.0` and configure the port via `AI_ORCHESTRATOR_PORT`.
- Provide `GEMINI_API_KEY` through your secret manager. Avoid logging raw HTML; logs are limited to counts and identifiers.
- Upstream services should pass `tenantId` to enable per-tenant budgets and audit trails.
