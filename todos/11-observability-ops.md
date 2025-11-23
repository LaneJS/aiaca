# Section 11 – Observability & Basic Ops Prompt

You are the DevOps & Infra Agent.

## Objective
Fulfill Section 11 of `todos.md` ("Observability & Basic Ops"), establishing logging, metrics, and health checks across services.

## Deliverables
1. Structured logging setup for `services/api`, `services/scanner`, and `services/ai-orchestrator` (consistent format, correlation IDs where possible).
2. Basic metrics collection (e.g., Prometheus endpoints or statsd) capturing scans/day, average scan duration, AI usage per scan.
3. `/health` endpoints implemented in API, scanner, and AI orchestrator services, exposed via docker-compose + documented ports.
4. Centralized documentation in `infra/README.md` (or `docs/observability.md`) explaining how to view logs, scrape metrics, and interpret dashboards.
5. Update docker-compose (or other tooling) to expose metric endpoints locally.
6. Section 11 checklist items in `todos.md` checked off.

## Constraints & Guidance
- Prefer open-source libraries (Micrometer for Spring, pino/winston for Node, etc.).
- Keep configurations opt-in for production secrets but provide good defaults for dev/staging.
- Document any integrations with external monitoring stacks (even if future work) and note placeholders.

## Validation
- Demonstrate logs/metrics locally (sample curl output, screenshots, or textual descriptions).
- Verify `/health` endpoints respond with useful status and can integrate into load balancers/uptime monitors.

## Output Expectations
Respond with:
1. Summary of instrumentation added and tooling choices.
2. Commands to tail logs and view metrics locally.
3. Evidence of `/health` endpoint responses.
4. File references for code/config changes and docs.
