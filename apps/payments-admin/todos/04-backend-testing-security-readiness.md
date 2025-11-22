Backend/API Agent — Testing, security, and production readiness
Goal: Harden the payments stack and validate behavior before frontend consumption.
Scope:
- Tests: unit + integration using Stripe mock client; contract tests for DTOs; API tests for RBAC and idempotency; seed data scripts for demo/stage.
- Security: rate limiting per account/user, audit logging for all mutations (append-only), request tracing, input validation for URLs/emails/amounts, tamper-proof audit log strategy.
- Compliance: ensure no PAN/CVC storage, redact sensitive fields in logs, environment-based Stripe keys + webhook secrets via env/secret manager.
- Observability: structured logging for payment events + webhooks, metrics/alerts for payment success, retry success, disputes, webhook failure count, reconciliation drift; health and readiness probes.
- Release gates: docs for env vars, migration runbook, and deploy checklist for staging -> prod; verify migrations on staging.
Dependencies: 01–03 complete; ensures backend stable for frontend rollout.
