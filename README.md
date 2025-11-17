# AI Accessibility Compliance Assistant (AACA)

Monorepo for the AACA platform: marketing site, dashboard, accessibility scanner, AI orchestration, embed script, and shared packages.

## Monorepo tooling
- **Nx (integrated workspace, npm)** – chosen for first-class Angular support, built-in TypeScript/Node tooling, and community plugins for Spring Boot. Nx gives consistent generators, caching, and task orchestration across the mixed stack. If requirements change, we can swap or layer Turborepo-style tasks behind the same Nx commands.
- **Package manager:** npm (lockfile committed for reproducible installs).
- See the collaboration charter in [AGENTS.md](AGENTS.md).

## Workspace layout
- `apps/marketing-site` – Angular marketing site.
- `apps/dashboard` – Angular dashboard.
- `services/api` – Spring Boot API skeleton.
- `services/scanner` – Node/TS accessibility scanner stub.
- `services/ai-orchestrator` – Node/TS AI orchestration stub.
- `packages/embed-script` – JS bundle for the one-line auto-fix snippet.
- `packages/ui` – Shared Angular UI components.
- `packages/domain` – Shared DTOs/models.
- `packages/config` – Shared configuration helpers.

## Getting started
1. Install dependencies: `npm install`
2. Run linting: `npm run lint`
3. Run unit tests: `npm run test`
4. Build all projects: `npm run build`
5. Verify no binaries are tracked before opening a PR: `npm run check:binaries`

### Environment configuration
- Copy `.env.sample` to `.env` before running Docker (the compose file expects this file to exist). If you prefer a different filename, pass it explicitly via `docker compose --env-file .env.local ...`.
- The compose stack reads from `.env` via `env_file`; update values there to match your local network without committing secrets.

### Local stack with Docker Compose
1. Build and start everything (PostgreSQL + API + services + frontends): `npm run docker:up:build`
2. Observe logs: `npm run docker:logs`
3. Stop and clean up: `npm run docker:down`
4. If you need a fresh image rebuild: `npm run docker:rebuild`

Services are reachable on the host using the ports defined in `.env.sample` (API on `http://localhost:8080`, marketing site on `http://localhost:4200`, dashboard on `http://localhost:4300`).

### Project-specific commands
- Marketing site: `npx nx serve marketing-site`, `npx nx test marketing-site`, `npx nx build marketing-site`
- Dashboard: `npx nx serve dashboard`, `npx nx test dashboard`, `npx nx build dashboard`
- API: `npx nx serve api`, `npx nx test api`, `npx nx build api`
- Scanner: `npx nx serve scanner`, `npx nx test scanner`, `npx nx build scanner`
- AI orchestrator: `npx nx serve ai-orchestrator`, `npx nx test ai-orchestrator`, `npx nx build ai-orchestrator`
- Shared packages (examples): `npx nx build embed-script`, `npx nx test domain`

## Conventions
- Formatting: Prettier (`.prettierrc`) with `.editorconfig` for consistent editors.
- Linting: ESLint via Nx targets.
- Testing: Jest for TS/JS projects, Spring Boot defaults for the API.

### Security, privacy, and compliance
- Public scans are rate limited by default to **5 requests/IP/minute** (configurable via `security.public-scan.rate-limit.*`).
- URLs are validated with a shared helper before any scan executes; non-http/https URLs are rejected and fragments removed.
- Scanner output is redacted to drop HTML snippets to avoid storing sensitive content. Retention notes and legal placeholders live in `docs/security-privacy.md` and `docs/legal/`.

### Content & docs
- User-facing copy for the marketing site lives in `apps/marketing-site/src/app/pages/**`, with FAQs and guide summaries in the `resources` page.
- Dashboard helper copy (severity levels, common issues) is centralized in `apps/dashboard/src/app/pages/scans/copy.ts`.
- Long-form guidance and the content style guide live under `docs/`, including `docs/guides/accessibility-report.md` and `docs/guides/embed-script.md`.

## Notes
- If you add new projects, prefer Nx generators to keep configuration consistent.
- Any deviations from this setup should be documented here for future contributors.
- To keep binaries out of the repo, the Spring Boot Gradle wrapper JAR is ignored; rehydrate it locally with `gradle wrapper --gradle-version 8.7` inside `services/api` before running Nx Gradle tasks.
- Use text-based assets (SVG over ICO/PNG) where possible; `.ico` files in app public folders are ignored to avoid binary commits.
- Run `npm run check:binaries` to fail fast if any binary-like tracked files slip through; the script flags common binary extensions and files containing null bytes.
