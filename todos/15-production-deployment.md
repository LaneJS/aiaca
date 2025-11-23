# Section 15 – Production & Staging Deployment Infrastructure

You are the DevOps & Infra Agent.

## Objective
Set up staging and production infrastructure to deploy the AACA platform beyond local development. This includes secrets management, DNS configuration, TLS certificates, production database, container registry, and deployment automation.

## Deliverables

### 1. Secrets Management
- [ ] Migrate secrets from `.env` files to proper secrets manager (Google Secret Manager, AWS Secrets Manager, or HashiCorp Vault)
- [ ] Secrets to migrate:
  - `JWT_SECRET` (API authentication)
  - `POSTGRES_PASSWORD` (database credentials)
  - `EMBED_SIGNING_KEY` (embed script validation)
  - `GEMINI_API_KEY` (AI orchestrator)
- [ ] Update deployment scripts to inject secrets as environment variables
- [ ] Document secret rotation procedures
- [ ] **CRITICAL**: Rotate the Gemini API key currently visible in `.env` (AIzaSyCSeU2NCcBdCDsFGfLeC6ck5JpA0f4eAl4)

### 2. Container Registry
- [ ] Set up container registry (Google Container Registry, AWS ECR, Docker Hub, or GitHub Container Registry)
- [ ] Configure CI/CD to build and push images on merge to main branch
- [ ] Tag images with git commit SHA and semantic version
- [ ] Document image naming conventions and retention policies

### 3. Production Database
- [ ] Provision managed PostgreSQL instance (Cloud SQL, RDS, or equivalent)
- [ ] Configure automated backups (daily minimum, 30-day retention)
- [ ] Set up read replicas if needed for scaling
- [ ] Document connection pooling configuration
- [ ] Test Flyway migrations against production-like database
- [ ] Create separate databases for staging and production

### 4. DNS & TLS Configuration
- [ ] Register domain or configure subdomain delegation
- [ ] Create DNS records:
  - `api.A11yAssistant.com` → API service load balancer
  - `www.A11yAssistant.com` → Marketing site
  - `app.A11yAssistant.com` → Dashboard
  - `cdn.A11yAssistant.com` → CDN distribution (see Section 16)
  - `scanner.A11yAssistant.com` → Scanner service (internal only, optional)
  - `ai.A11yAssistant.com` → AI orchestrator (internal only, optional)
- [ ] Configure TLS certificates (Let's Encrypt, AWS ACM, or Cloudflare)
- [ ] Set up auto-renewal for certificates
- [ ] Configure HTTPS redirects (HTTP → HTTPS)
- [ ] Staging equivalents: `staging.api.aaca.test`, `staging.aaca.test`, etc.

### 5. CORS & Network Security
- [ ] Configure CORS policies on API to allow:
  - `https://www.A11yAssistant.com` (marketing site)
  - `https://app.A11yAssistant.com` (dashboard)
  - Customer domains using embed script (configure allow-list or wildcard policy)
- [ ] Set up security headers (HSTS, CSP, X-Frame-Options)
- [ ] Configure rate limiting at load balancer or API gateway level
- [ ] Implement IP allowlisting for internal services (scanner, AI orchestrator)

### 6. Environment Configuration Files
- [ ] Create `.env.staging` with staging values (per checklist in `infra/README.md`)
- [ ] Create `.env.production` with production values
- [ ] Add validation script to check required env vars are present
- [ ] Document environment-specific configuration in `infra/README.md`

### 7. Deployment Automation
- [ ] Implement deployment pipeline (GitHub Actions, GitLab CI, Jenkins, or similar):
  - Build Docker images
  - Run tests
  - Push to container registry
  - Deploy to staging automatically on main branch merge
  - Deploy to production via manual approval or git tag
- [ ] Create deployment runbook in `docs/deployment/` covering:
  - Pre-deployment checklist
  - Deployment steps
  - Rollback procedures
  - Health check verification
  - Post-deployment smoke tests
- [ ] Set up deployment notifications (Slack, Discord, email)

### 8. Container Orchestration (Choose One)
- [ ] **Option A: Docker Compose** (simplest, single-host):
  - Deploy via docker-compose on VM with systemd service
  - Configure log rotation and monitoring
- [ ] **Option B: Kubernetes** (scalable, multi-host):
  - Create k8s manifests or Helm charts for all services
  - Configure ingress controller for routing
  - Set up horizontal pod autoscaling
  - Implement liveness and readiness probes
- [ ] Document choice and rationale in `infra/README.md`

### 9. Observability for Production
- [ ] Extend observability stack (build on Section 11):
  - Deploy Prometheus for metrics collection
  - Deploy Grafana for dashboards
  - Configure alerting (PagerDuty, Opsgenie, or email)
  - Set up log aggregation (Cloud Logging, ELK stack, or similar)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, or StatusCake) for:
  - `https://api.A11yAssistant.com/health`
  - `https://www.A11yAssistant.com`
  - `https://app.A11yAssistant.com`
- [ ] Create runbooks for common alerts
- [ ] Set up status page (e.g., status.A11yAssistant.com)

### 10. Documentation
- [ ] Update `infra/README.md` with production architecture diagram
- [ ] Document disaster recovery procedures
- [ ] Create incident response playbook
- [ ] Update `AGENTS.md` with deployment responsibilities

## Constraints & Guidance
- Follow cloud provider best practices for security and resilience
- Prefer managed services over self-hosted where cost-effective
- Keep staging environment as close to production as possible
- Document all manual steps with goal of automating them
- Ensure all secrets are encrypted at rest and in transit
- Tag all cloud resources for cost tracking and ownership

## Validation
- Deploy to staging environment and verify:
  - All services start successfully
  - Health checks pass
  - Full user journey works (signup → scan → view results)
  - TLS certificates are valid
  - Logs and metrics are collected
- Run security scan (nmap, SSL Labs, security headers check)
- Perform load test to identify bottlenecks
- Test rollback procedure
- Verify secrets are not exposed in logs or error messages

## Output Expectations
Respond with:
1. Summary of infrastructure decisions (cloud provider, orchestration choice, secrets manager)
2. Architecture diagram showing production deployment
3. Deployment evidence (URLs, health check results, screenshots)
4. Configuration examples (sanitized, no real secrets)
5. Testing results (smoke tests, security scans)
6. File references for:
   - CI/CD pipeline configuration
   - Deployment runbook
   - Environment configuration templates
   - Kubernetes manifests or docker-compose updates
7. Outstanding items or known risks with mitigation plans
