# Section 12 – Security, Privacy & Compliance Prompt

You are the Backend API + DevOps partnership focusing on security/compliance.

## Objective
Execute Section 12 of `todos.md` ("Security, Privacy & Compliance – MVP").

## Deliverables
1. Rate limiting on `POST /public/scans` (API layer or gateway) with documented limits + tests.
2. URL validation/sanitization before scans (shared validator in `packages/domain` and enforced in API + scanner).
3. Strategy + implementation to avoid storing sensitive page contents (document redaction rules, config toggles, and data retention policies).
4. Draft Privacy Policy and Terms of Service (placeholders acceptable) stored under `docs/legal/` and linked from marketing site footer.
5. Cookie/tracking banner decision documented; implement banner only if necessary, ensuring compliance.
6. Update security/privacy considerations in `README.md` or dedicated doc, plus callouts in `AGENTS.md` if responsibilities change.
7. Section 12 items in `todos.md` marked complete with notes.

## Constraints & Guidance
- Follow least-privilege principles; document secrets handling and data minimization.
- Coordinate across services to ensure no contradictory behaviors (e.g., scanner storing raw HTML while policy says otherwise).
- Keep legal text clearly labeled as placeholder and highlight next steps for legal review.

## Validation
- Automated tests for URL validation and rate limiting (unit/integration).
- Manual verification of legal pages rendering on marketing site and footer links.
- Provide evidence (logs/metrics) that sensitive data is not persisted or is scrubbed.

## Output Expectations
Respond with:
1. Summary of security/privacy controls implemented + rationale.
2. Tests run and results (commands, sample outputs).
3. Links to code/docs updated (rate limiter config, validators, legal docs, marketing site updates).
