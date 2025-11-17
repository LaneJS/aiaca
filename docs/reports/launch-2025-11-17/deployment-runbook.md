# Deployment Runbook (Staging → Production)

- **Date:** 2025-11-17
- **Owner:** DevOps (handoff: devops@aaca.test)
- **Artifacts:** Docker images built via Nx + Gradle; pushed to `registry.aaca.test` (staging) and `registry.aaca.prod` (production).

## Prerequisites
- `.env.staging` / `.env.production` populated (see `infra/README.md`).
- CI runner with Docker + `gcloud`/`aws` auth to container registry.
- Database migrations applied via Flyway on API startup (already bundled).

## Steps (Staging)
1. `npm run ci:build` – builds Angular apps + Node services; Gradle builds API jar.
2. `npm run ci:docker:push -- --env-file .env.staging` – builds + pushes images to staging registry.
3. `docker compose -f docker-compose.yml --env-file .env.staging pull && docker compose -f docker-compose.yml --env-file .env.staging up -d` on staging host.
4. Verify health: `curl -f https://staging.api.aaca.test/health`, `curl -f https://staging.scanner.aaca.test/health`.
5. Run smoke tests: `npm run test:smoke -- --env staging` (uses cases in `docs/reports/launch-2025-11-17/smoke-tests.md`).

## Steps (Production or Dry Run)
1. Tag release: `git tag -a v0.9.0-launch -m "Launch readiness" && git push origin v0.9.0-launch`.
2. `npm run ci:docker:push -- --env-file .env.production`.
3. `docker compose -f docker-compose.yml --env-file .env.production pull && docker compose -f docker-compose.yml --env-file .env.production up -d --remove-orphans` on production host (or execute with `--dry-run` flag in CI to validate manifests without applying).
4. Post-deploy verification:
   - `curl -f https://api.aaca.com/health`
   - `curl -f https://scanner.aaca.com/health`
   - Spot-check marketing site and dashboard load times.
5. Rollback plan: `docker compose -f docker-compose.yml --env-file .env.production up -d api=scoped-tag scanner=scoped-tag` using previous image tags recorded in deployment log.

## Observability Hooks
- Prometheus scrapes remain enabled; Grafana dashboards `a11y-overview` and `scan-latency` should show data within 5 minutes post-deploy.
- Uptime monitor thresholds documented in `monitoring.md` (this folder).

## Notes
- Current run was a **dry run** against staging configs (registry pushes skipped in sandbox). All commands validated syntactically; execute on CI with registry credentials for real deploy.
