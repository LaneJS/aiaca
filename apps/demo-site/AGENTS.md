# AGENTS.md - Demo Site (`apps/demo-site`)

Scope: all files under `apps/demo-site/**`.

## Mission
`apps/demo-site` is the intentionally imperfect AACA demo app. Its job is to produce predictable accessibility findings, demonstrate embed-script remediation behavior, and support demo scan flows through API integration.

Keep this app safe and deterministic for demos. Do not let it drift into a production-quality accessibility baseline.

## Non-goals
- Do not fully fix the default raw experience.
- Do not remove intentional baseline violations unless you replace them with new intentional violations plus matching remediations.
- Do not turn this app into a production UX surface (auth, billing, account flows, or feature-complete dashboard behavior).
- Do not capture sensitive form data, leak secrets, or add unsafe telemetry.

## Stable Embed Contract
Source: `apps/demo-site/public/embed/autofix-demo.js`

- Keep `window.AACAEmbedDemo.enable()` and `window.AACAEmbedDemo.disable()` stable for demo controls.
- `enable()` must be idempotent and apply only demo remediation behavior.
- `disable()` must fully restore the intentionally broken baseline.
- If contract changes are unavoidable, update demo controls/tests in the same change.

## Rules for New Broken Patterns
1. Add an intentional failure that is scanner-detectable in raw mode.
2. Add a deterministic remediation hook in `public/embed/autofix-demo.js`.
3. Ensure remediation is reversible via `disable()` with no persistent side effects.
4. Expose clear before/after evidence in the UI or demo log.
5. Add or update tests that verify both broken baseline and fixed mode.

## Workflow Commands
Use npm scripts or Docker commands in this environment; avoid direct `nx` CLI invocations.

- Run demo-site locally: `npm run nx -- run demo-site:serve`
- Build demo-site: `npm run nx -- run demo-site:build`
- Test demo-site: `npm run nx -- run demo-site:test`
- Lint demo-site: `npm run nx -- run demo-site:lint`
- Start API + demo with Docker: `npm run docker:up -- api demo-site`
- Stop Docker stack: `npm run docker:down`

## Demo Validation Checklist
- Broken baseline verified: intentional violations are present and scanner-visible when autofix is off.
- Fixed mode verified: `enable()` applies expected remediations and `disable()` returns to broken baseline.
- Integration verified: demo still triggers or links scan flows through API and scanner/embed outcomes match demo claims.
- Safety/privacy verified: no sensitive data capture paths and no secret leakage in code, logs, or UI copy.
