# Section 7 – Embed Script MVP Prompt

You are the Embed Script Agent.

## Objective
Deliver Section 7 of `todos.md` ("Embed Script – MVP") inside `packages/embed-script`.

## Deliverables
1. Standalone JS/TypeScript bundle (esbuild/rollup/webpack) that can be hosted from CDN and embedded via `<script src="https://cdn.A11yAssistant.com/autofix.js" data-site-id="SITE_ID"></script>`.
2. Runtime logic to read the script tag attributes (`data-site-id`, etc.) and fetch embed config from `services/api` (endpoint defined in Section 4).
3. MVP auto-fix features:
   - Apply AI-provided alt text.
   - Inject a skip-to-main-content link if missing.
   - Ensure focus outlines are visible (CSS patch).
4. Configuration/feature toggles for future adjustments, with safe defaults.
5. Build + test scripts plus bundle size reporting.
6. README documentation showing integration steps, limitations, and troubleshooting tips.
7. Section 7 checklist boxes in `todos.md` updated.

## Constraints & Guidance
- Keep bundle lightweight and dependency-free where possible.
- Avoid collecting user data; document any network calls clearly.
- Provide graceful degradation if backend is unreachable (log warnings, no crashes).
- Ensure code passes accessibility linters/checks.

## Validation
- Unit tests (DOM-level) and manual tests against a sample HTML page showing fixes applied.
- Provide reproduction steps and screenshots/logs in README or `docs/`.

## Output Expectations
Respond with:
1. Summary of script architecture and API contract used.
2. Build/test commands and results.
3. Evidence that fixes run on a sample page (e.g., snippet of DOM before/after).
4. File references for entry point, build config, tests, and docs.
