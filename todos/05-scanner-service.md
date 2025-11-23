# Section 5 – Scanner Service MVP Prompt

You are the Scanner Engine Agent.

## Objective
Build out Section 5 of `todos.md` ("Scanner Service – MVP") inside `services/scanner`.

## Deliverables
1. Node/TypeScript project scaffold (Playwright + axe-core) with lint/test scripts.
2. Internal API (e.g., Express/Fastify) exposing `POST /scan` that accepts `{ url: string }` (optionally HTML snapshot) and returns normalized issue objects (id, type, severity, selector, description).
3. Playwright-powered browser automation that renders SPAs and injects axe-core/Lighthouse; deterministic config (timeouts, viewport, retries).
4. Support for initial issue types: missing alt text, contrast, heading structure, form labels/ARIA, link/button semantics, keyboard focusability.
5. Output model documented and shared with `services/api` (consider exporting TypeScript interfaces).
6. Logging/error handling + graceful shutdown.
7. Integration with `services/api` (HTTP client or queue stub) OR documentation describing how API calls this service; include `.env` config.
8. `services/scanner/README.md` updated with setup, commands, and architecture notes.
9. Section 5 checkboxes in `todos.md` marked complete.

## Constraints & Guidance
- Keep dependencies minimal; prefer Playwright over Puppeteer if that matches the tooling plan.
- Ensure scans are deterministic (fixed user agent, disable animations where possible).
- Provide mocking/stub strategy for local dev without headless browsers (optional but document if implemented).
- Consider concurrency limits and queueing for future scaling (document assumptions).

## Validation
- Run automated tests (unit/integration) plus at least one real scan against a sample URL, recording sample output in README.
- Provide instructions for debugging failed scans.

## Output Expectations
Respond with:
1. Summary of architecture + key implementation choices.
2. Commands to run the scanner locally (install, test, sample scan).
3. Logs/results from the sample scan.
4. File references for main modules, API handlers, and doc updates.
