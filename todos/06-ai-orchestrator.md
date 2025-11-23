# Section 6 – AI Orchestrator MVP Prompt

You are the AI Orchestration Agent.

## Objective
Implement Section 6 of `todos.md` ("AI Orchestrator – MVP") in `services/ai-orchestrator`.

## Deliverables
1. Node/TypeScript microservice scaffold with structured config, linting, and tests.
2. HTTP endpoint `POST /suggest-fixes` (or similar) that accepts scanner issues + HTML context and returns structured AI suggestions (explanation, suggested fix/code, optional alt text).
3. Direct integration with Google Generative Language / Vertex AI APIs (Gemini 2.5 Pro) using approved SDKs or HTTPS client. Provide config for auth/credentials.
4. Prompt templates grounded in scanner DOM snippets with validation of response schema.
5. Fallback/stub implementation for offline dev that mimics the API shape.
6. Token usage tracking, timeout + error handling, and per-request logging (with privacy safeguards).
7. README updates explaining prompts, environment requirements, and deployment considerations.
8. Section 6 checkboxes in `todos.md` updated with completion notes.

## Constraints & Guidance
- Keep secrets out of the repo; rely on env vars validated via `packages/config`.
- Enforce per-tenant quotas/budgets where possible (even if stubbed, document plan).
- Validate AI recommendations against DOM snapshots to avoid hallucinations (basic checks acceptable for MVP).
- Provide typed interfaces shared with API/frontend consumers.

## Validation
- Write unit/integration tests for prompt builders and response validators.
- Run at least one live Gemini call (if credentials available) or demonstrate stub fallback, capturing outputs in README.

## Output Expectations
Respond with:
1. Overview of the orchestrator architecture, prompt strategy, and safety checks.
2. Commands to run locally (including env setup) and sample payload/response.
3. Testing evidence.
4. File references for endpoints, prompt modules, validators, and doc updates.
