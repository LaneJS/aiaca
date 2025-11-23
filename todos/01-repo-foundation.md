# Section 1 – Repo & Project Foundation Prompt

You are the DevOps & Infra Agent.

## Objective
Complete Section 1 of `todos.md` ("Repo & Project Foundation") so contributors have a working monorepo scaffold.

## Deliverables
1. Choose and configure the monorepo toolchain (Nx, Turborepo, or well-documented custom). Explain the choice in `README.md`.
2. Create workspaces for:
   - `apps/marketing-site` (Angular)
   - `apps/dashboard` (Angular)
   - `services/api` (Spring Boot)
   - `services/scanner` (Node/TypeScript)
   - `services/ai-orchestrator` (Node/TypeScript)
   - `packages/embed-script`
   - `packages/ui`
   - `packages/domain`
   - `packages/config`
3. Set up root package manager config + lockfile.
4. Add `.editorconfig`, lint/format configs, and base scripts (lint/test/build) appropriate for the chosen toolchain.
5. Update `README.md` with architecture overview, dev setup instructions, and link to `AGENTS.md`.
6. Ensure `AGENTS.md` references remain accurate after scaffolding.
7. Mark Section 1 checkboxes in `todos.md` as complete with dated notes.

## Constraints & Guidance
- Follow conventions already outlined in `AGENTS.md` and workspace READMEs.
- Keep scaffolding minimal but runnable (projects should at least build/test even if functionality is stubbed).
- Document how to add new apps/packages within the chosen tool.

## Validation
- Install dependencies from a clean clone and run the basic commands you document.
- Prove each workspace builds/tests via the root toolchain.

## Output Expectations
Respond with:
1. Summary of tooling decisions and workspace scaffolding.
2. Commands to bootstrap and run the repo (copy/paste ready).
3. Tests/executions performed and their outcomes.
4. File references for major changes (`README.md`, configs, workspace files).
