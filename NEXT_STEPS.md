# Next Steps Checklist

You already have the codebase; the items below cover the software you need, which third-party APIs to sign up for, and how to boot everything locally.

## 1. Install required tooling
- **Node.js 24 LTS + npm** – all Nx/Angular/TypeScript projects run on this toolchain (`package.json`). Use `nvm use` to automatically switch to the correct version if you have nvm installed.
- **Nx CLI (via `npx nx …`) and Angular tooling** – automatically available once dependencies are installed.
- **Java 21 JDK** – Spring Boot API (`services/api/build.gradle`) compiles against Java 21; install Temurin/Corretto/OpenJDK 21.
- **Gradle** – run the repo wrapper script (`./gradlew`) for all API tasks so you stay on Gradle 8.x. Only install Gradle globally if you must regenerate `gradle/wrapper/gradle-wrapper.jar`, and make sure it is **Gradle 8.7 or newer**—older versions surface `TaskContainer.named(...)` errors when evaluating the Spring Boot build.
- **Docker Desktop / docker-compose** – quickest way to boot the full stack with Postgres and all services (`npm run docker:up:build` from the root `README.md`).
- **Playwright browser binaries** – the scanner service needs Chromium (`services/scanner/README.md`); run `npx playwright install chromium` (and `npx playwright install-deps chromium` on Linux).

## 2. Copy and adjust environment files
1. Duplicate the root sample: `cp .env.sample .env`. Update any ports if the defaults (`MARKETING_SITE_PORT=4200`, `DASHBOARD_PORT=4300`, `API_PORT=8080`, etc.) conflict on your machine.
2. If you plan to run the scanner or AI orchestrator outside docker-compose, create service-level env files (e.g., `cp services/scanner/.env.sample services/scanner/.env`) and keep values in sync with the root `.env`.
3. Never commit secrets—use `.env.local` or your shell profile for overrides when needed.

## 3. Sign up for external APIs (only if you want live AI suggestions)
- **Gemini / Google AI Studio** – the AI orchestrator (`services/ai-orchestrator/README.md`) uses Google’s Generative Language API.
  1. Create or select a Google Cloud project.
  2. Enable the Generative Language / Vertex AI API.
  3. Generate an API key in Google AI Studio (or set up Vertex AI service account credentials).
  4. Export it as `GEMINI_API_KEY` (either in `.env` or your shell) and optionally set `GEMINI_MODEL` if you want something other than the default `gemini-1.5-pro`.
  5. During development you can skip this entirely—the orchestrator automatically falls back to the stub provider when the API key is missing (`AI_ORCHESTRATOR_USE_STUB=true` forces the stub).
- **Other services** – no additional third-party sign-ups are required for the MVP stack; Postgres, Playwright, and the scanner are all self-hosted.

## 4. Install dependencies per repo instructions
```bash
npm install
npx playwright install chromium          # scanner requirement
./gradlew wrapper --gradle-version 8.7   # updates the wrapper using the pinned Gradle version
# If gradle/wrapper/gradle-wrapper.jar is missing entirely, install Gradle 8.7+ and rerun the same command with `gradle` once.
```
Running `npm install` at the repo root pulls every workspace package defined in `package.json` and sets up Nx executors.

## 5. Boot the stack locally
### Option A – individual Nx serves (useful while developing UI or API separately)
```bash
# Terminal 1: API (H2, port 8080 unless overridden)
npx nx serve api

# Terminal 2: Marketing site (Angular, port 4200)
npx nx serve marketing-site

# Terminal 3: Dashboard app (Angular, port 4300)
npx nx serve dashboard

# Optional terminals:
npx nx serve scanner          # Fastify + Playwright service, port 4001 by default
npx nx serve ai-orchestrator  # Fastify AI suggestions, port 4002
```
The API defaults to an in-memory H2 DB; to use Postgres, export `SPRING_DATASOURCE_*` vars as described in `services/api/README.md`.

### Option B – full docker-compose stack
```bash
cp .env.sample .env   # if you have not already
npm run docker:up:build
```
This command builds and starts Postgres, API, scanner, AI orchestrator, and both Angular apps watching for file changes. Use `npm run docker:logs` to tail logs and `npm run docker:down` to stop everything.

## 6. Run smoke checks once services are up
- Visit `http://localhost:4200` (marketing site) and `http://localhost:4300` (dashboard) as listed in the root `README.md`.
- Call the API’s health endpoint: `curl http://localhost:8080/api/v1/health` (or hit the Swagger UI once added).
- Test the public scan flow via `curl -X POST http://localhost:8080/api/v1/public/scans -H "Content-Type: application/json" -d '{"url":"https://example.com"}'`.
- Trigger a sample scanner run without the HTTP server: `npm run scanner:sample -- https://example.com`.

## 7. Helpful follow-up tasks
- Run quality gates: `npm run lint`, `npm run test`, and `npm run build` (root `README.md`).
- If you plan to deploy soon, document your hosting target (Cloud Run, App Engine, etc.) and wire the `docker-compose` images into that path.
- Track secrets separately (e.g., use `gcloud secrets`, 1Password, Doppler) before inviting collaborators.
