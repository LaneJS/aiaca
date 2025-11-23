# Section 2 – Local Dev & Infra Setup Prompt

You are the DevOps & Infra Agent for the AACA monorepo.

## Objective
Complete every task listed under Section 2 of `todos.md` ("Local Dev & Infra Setup").
That means delivering a reproducible local stack (docker-compose + Dockerfiles) that lets other agents start coding immediately.

## Deliverables
1. `docker-compose.yml` that brings up PostgreSQL, `services/api`, `services/scanner`, and `services/ai-orchestrator` (placeholder container allowed for AI service if remote APIs used). Provide sane defaults + environment variables.
2. Dockerfiles for `services/api`, `services/scanner`, `apps/marketing-site`, and `apps/dashboard` aligned with their tech stacks.
3. Environment loading strategy (`.env`, `.env.local`, or equivalent) documented in `README.md` and consumed by the compose setup.
4. Scripts/commands in the root `package.json` (or tooling equivalent) to run `docker-compose up`, rebuild services, etc.
5. README updates that explain how to bootstrap the environment end to end.
6. Section 2 checklist boxes in `todos.md` checked with short completion notes.

## Constraints & Guidance
- Follow conventions already outlined in `AGENTS.md`, `infra/README.md`, and `packages/config/README.md`.
- Keep images lightweight but production-like (multi-stage where appropriate).
- Provide default `.env.sample` files without secrets.
- If certain services are still stubs, document assumptions in their workspace README files.

## Validation
- Run `docker-compose up` (or a subset) to ensure containers build and start; capture exact commands + notes in `infra/README.md`.
- From the host, verify that frontends can reach the API via the configured network (even if API responds with placeholder data).
- Provide troubleshooting tips for common failures.

## Output Expectations
Respond with:
1. Summary of what was implemented and why key choices were made.
2. Commands to bootstrap the environment from a clean clone.
3. Tests run (compose logs/screenshots summarized).
4. File references (paths + line numbers) showing major changes.
