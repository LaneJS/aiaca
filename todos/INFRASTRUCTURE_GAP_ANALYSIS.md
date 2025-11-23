# Infrastructure Gap Analysis – Local vs Production Readiness

**Generated**: 2025-11-17
**Status**: Identifies what's working locally vs what's needed for production deployment

---

## Executive Summary

The AACA platform is **fully functional for local development** with all services running via Docker Compose. However, **critical integration and production deployment infrastructure is missing** to make the scanner work for real production traffic.

### Key Findings
- ✅ All services are built and running locally
- ✅ Database schema and migrations complete
- ✅ Frontend apps connect to API
- ❌ **CRITICAL**: API never calls Scanner or AI Orchestrator (returns stub data only)
- ❌ **CRITICAL**: Production deployment infrastructure missing
- ❌ Secrets exposed in `.env` file (Gemini API key visible in repo)
- ❌ No CDN for embed script distribution

---

## Infrastructure Assessment by Category

### 1. Core Services ✅ COMPLETE (Local Only)

**Status**: All services scaffolded, containerized, and running via docker-compose

| Service | Port | Status | Notes |
|---------|------|--------|-------|
| PostgreSQL | 5432 | ✅ Running | Local Docker volume, not production-ready |
| API (Spring Boot) | 8080 | ✅ Running | Returns stub data, doesn't call downstream services |
| Scanner (Node/TS) | 4001 | ✅ Running | Works independently but never called by API |
| AI Orchestrator (Node/TS) | 4002 | ✅ Running | Gemini key configured but never used |
| Marketing Site (Angular) | 4200 | ✅ Running | Connects to API |
| Dashboard (Angular) | 4300 | ✅ Running | Connects to API |

**Gap**: Services exist but don't communicate (see Section 2)

---

### 2. Service Integration ❌ CRITICAL GAP

**Status**: API service returns hardcoded stub data instead of calling Scanner and AI Orchestrator

**Current Behavior**:
- User submits scan request → API returns fake example data
- Scanner service is never called
- AI Orchestrator is never called
- Database stores stub issues, not real scan results

**What's Missing** (See `todos/14-service-integration.md`):
- HTTP clients in API to call Scanner and AI Orchestrator
- Update `ScanService.java` to make real service calls
- Error handling for downstream service failures
- Integration tests proving end-to-end flow

**Impact**: Scanner appears to work locally but doesn't actually scan real sites

**Priority**: 🔴 BLOCKER for production launch

---

### 3. Scanner Service ✅ MOSTLY COMPLETE

**Status**: Scanner service is fully functional with Playwright + axe-core

| Component | Status | Notes |
|-----------|--------|-------|
| Playwright + Chromium | ✅ Installed | Works in Docker container |
| axe-core integration | ✅ Working | Returns real accessibility issues |
| Headless browser | ✅ Configured | Proper sandbox flags in Dockerfile |
| API endpoint `/scan` | ✅ Implemented | Accepts URL, returns normalized issues |
| Environment config | ✅ Done | Timeouts, viewport, user agent configured |
| Network access | ✅ Works | Can reach external URLs from container |

**Gaps**:
- Never called by API (integration issue)
- No production scaling strategy (single-process only)

**Priority**: 🟢 Ready for integration

---

### 4. AI Orchestrator Service ✅ CONFIGURED, ❌ UNUSED

**Status**: AI Orchestrator is configured with Gemini API key but never receives requests

| Component | Status | Notes |
|-----------|--------|-------|
| Gemini API key | ⚠️ Configured | **Security issue**: Key visible in `.env` file |
| Stub provider | ✅ Working | Falls back when Gemini unavailable |
| API endpoint `/suggest-fixes` | ✅ Implemented | Accepts issues, returns suggestions |
| Timeout handling | ✅ Configured | 20s timeout with fallback |
| Token budgeting | ✅ Implemented | Per-tenant tracking |

**Gaps**:
- Never called by API (integration issue)
- Gemini API key not rotated (exposed in git history)
- No production secrets management

**Priority**: 🟡 Ready but needs security fixes

---

### 5. Database & Migrations ✅ COMPLETE (Local)

**Status**: Schema complete with Flyway migrations, works for local development

| Component | Status | Production Ready |
|-----------|--------|------------------|
| PostgreSQL schema | ✅ Done | No (local Docker volume) |
| Flyway migrations | ✅ Working | Yes (portable) |
| Seed data | ✅ Local only | N/A |
| Backup strategy | ❌ None | **Required for production** |
| Read replicas | ❌ None | Optional for scale |

**Gaps for Production** (See `todos/15-production-deployment.md`):
- Managed database instance (Cloud SQL, RDS)
- Automated backups
- Connection pooling configuration
- Separate staging/production databases

**Priority**: 🟡 Needs production database provisioning

---

### 6. Secrets Management ❌ CRITICAL SECURITY GAP

**Status**: All secrets stored in plaintext `.env` file

**Current Exposure**:
```env
GEMINI_API_KEY=AIzaSyCSeU2NCcBdCDsFGfLeC6ck5JpA0f4eAl4  # ⚠️ EXPOSED IN REPO
```

**Secrets Requiring Management**:
- `JWT_SECRET` – API authentication
- `POSTGRES_PASSWORD` – Database credentials
- `EMBED_SIGNING_KEY` – Embed script validation
- `GEMINI_API_KEY` – AI orchestrator (currently exposed)

**What's Missing** (See `todos/15-production-deployment.md`):
- Secrets manager integration (Google Secret Manager, AWS Secrets Manager, Vault)
- Secret rotation procedures
- Encrypted secrets in CI/CD

**Actions Required**:
1. 🔴 **IMMEDIATE**: Rotate exposed Gemini API key
2. 🔴 **IMMEDIATE**: Remove secrets from `.env` file
3. 🔴 **BEFORE PROD**: Set up secrets manager
4. 🔴 **BEFORE PROD**: Update deployment scripts to inject secrets

**Priority**: 🔴 CRITICAL SECURITY ISSUE

---

### 7. CDN for Embed Script ❌ MISSING

**Status**: Embed script built but not deployed to CDN

**Current State**:
- Build output: `packages/embed-script/dist/autofix.js`
- Local testing: Works via local file or dev server
- Production URL: `https://cdn.A11yAssistant.com/autofix.js` – **does not exist**

**What's Missing** (See `todos/16-cdn-deployment.md`):
- CDN provider setup (Cloudflare, CloudFront, Cloud CDN)
- Storage backend (S3, Cloud Storage, R2)
- Build pipeline to upload to CDN
- Versioning strategy (`autofix-v1.0.0.js`)
- Cache configuration
- SRI hash generation

**Impact**: Customers cannot use embed script in production

**Priority**: 🔴 BLOCKER for embed script feature

---

### 8. DNS & TLS Configuration ❌ NOT STARTED

**Status**: No production domains configured

**Required DNS Records**:
| Domain | Purpose | Status |
|--------|---------|--------|
| `api.A11yAssistant.com` | API service | ❌ Not configured |
| `www.A11yAssistant.com` | Marketing site | ❌ Not configured |
| `app.A11yAssistant.com` | Dashboard | ❌ Not configured |
| `cdn.A11yAssistant.com` | Embed script CDN | ❌ Not configured |
| `scanner.A11yAssistant.com` | Scanner (internal) | ❌ Optional |
| `ai.A11yAssistant.com` | AI orchestrator (internal) | ❌ Optional |

**TLS Certificates**: Not configured

**Staging Equivalent**: `staging.aaca.test` domains not set up

**What's Missing** (See `todos/15-production-deployment.md`):
- Domain registration or subdomain delegation
- DNS record creation
- TLS certificate provisioning (Let's Encrypt, ACM, Cloudflare)
- Certificate auto-renewal

**Priority**: 🟡 Required before production launch

---

### 9. CORS Configuration ⚠️ PARTIAL

**Status**: Basic CORS exists but not configured for production domains

**Current State**:
- Local CORS: Works for localhost:4200, localhost:4300
- Production CORS: Not configured

**What's Missing** (See `todos/15-production-deployment.md`):
- Allow `https://www.A11yAssistant.com` (marketing site)
- Allow `https://app.A11yAssistant.com` (dashboard)
- Allow customer domains using embed script (wildcard or allow-list)
- Security headers (HSTS, CSP, X-Frame-Options)

**Priority**: 🟡 Required before production launch

---

### 10. Observability ✅ BASIC, ⚠️ NEEDS PRODUCTION SETUP

**Status**: Health endpoints and metrics implemented, but no production monitoring

| Component | Local | Production |
|-----------|-------|------------|
| Health endpoints | ✅ `/health` on all services | ❌ No uptime monitoring |
| Metrics | ✅ Prometheus format exposed | ❌ No collection |
| Structured logging | ✅ JSON logs with correlation IDs | ❌ No aggregation |
| Dashboards | ❌ None | ❌ None |
| Alerting | ❌ None | ❌ None |

**What's Missing** (See `todos/15-production-deployment.md`):
- Prometheus deployment
- Grafana dashboards
- Log aggregation (Cloud Logging, ELK)
- Uptime monitoring (UptimeRobot, Pingdom)
- Alert configuration (PagerDuty, email)
- Status page

**Priority**: 🟡 Required for production operations

---

### 11. Container Registry ❌ NOT CONFIGURED

**Status**: Docker images built locally but not pushed to registry

**Current State**:
- Images built via `docker-compose build`
- No registry configured
- No image tagging strategy

**What's Missing** (See `todos/15-production-deployment.md`):
- Container registry setup (GCR, ECR, Docker Hub, GHCR)
- CI/CD pipeline to build and push images
- Image tagging (git SHA, semantic version)
- Retention policies

**Priority**: 🟡 Required for production deployment

---

### 12. Deployment Automation ❌ MANUAL ONLY

**Status**: No CI/CD pipeline, all deployments manual

**What's Missing** (See `todos/15-production-deployment.md`):
- CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins)
- Automated testing in pipeline
- Staging auto-deployment on main merge
- Production deployment via git tag or manual approval
- Deployment runbook
- Rollback procedures

**Priority**: 🟡 Required for reliable deployments

---

### 13. Container Orchestration ⚠️ DECISION NEEDED

**Status**: Local docker-compose works, production strategy undefined

**Options**:
- **Option A**: Docker Compose on VM (simplest, good for MVP)
- **Option B**: Kubernetes (scalable, more complex)

**What's Missing** (See `todos/15-production-deployment.md`):
- Decision on orchestration platform
- Production manifests (docker-compose.yml for VM or k8s manifests)
- Load balancer configuration
- Auto-scaling policies (if k8s)

**Priority**: 🟡 Architectural decision needed

---

## Priority Matrix

### 🔴 Critical Blockers (Must Fix Before Production)
1. **Service Integration** (`todos/14-service-integration.md`) – API doesn't call Scanner/AI Orchestrator
2. **Secrets Management** – Rotate exposed Gemini key, implement secrets manager
3. **CDN Deployment** (`todos/16-cdn-deployment.md`) – Embed script unavailable

### 🟡 High Priority (Required for Launch)
4. **Production Database** – Managed PostgreSQL instance
5. **DNS & TLS** – Production domains and certificates
6. **Container Registry** – Push images for deployment
7. **Deployment Automation** – CI/CD pipeline
8. **Observability** – Monitoring and alerting

### 🟢 Medium Priority (Post-Launch)
9. **Container Orchestration** – k8s vs docker-compose decision
10. **CORS Refinement** – Production domain configuration
11. **Performance Testing** – Load testing and optimization

---

## Next Steps

### Immediate (This Week)
1. ✅ Created `todos/14-service-integration.md`
2. ✅ Created `todos/15-production-deployment.md`
3. ✅ Created `todos/16-cdn-deployment.md`
4. 🔴 **TODO**: Rotate exposed Gemini API key
5. 🔴 **TODO**: Implement service integration (API → Scanner → AI)

### Short-Term (Next 2 Weeks)
6. Set up secrets manager
7. Provision production database
8. Configure DNS and TLS
9. Set up container registry
10. Build CI/CD pipeline

### Before Launch
11. Deploy to staging environment
12. Run full smoke tests
13. Set up monitoring and alerting
14. Deploy embed script to CDN
15. Security audit and penetration testing

---

## Cost Estimates (Ballpark for GCP/AWS)

| Component | Monthly Cost (Estimate) |
|-----------|-------------------------|
| Managed PostgreSQL (small) | $25-50 |
| Compute (3-5 VMs or k8s cluster) | $50-150 |
| Load Balancer | $20-30 |
| CDN (1TB bandwidth) | $10-50 |
| Secrets Manager | $5-10 |
| Monitoring/Logging | $20-50 |
| **Total (MVP)** | **$130-340/month** |

---

## Conclusion

**Local Development**: ✅ Fully functional
**Production Readiness**: ❌ Major gaps in integration, security, and deployment

**Critical Path to Production**:
1. Fix service integration (Section 14)
2. Fix secrets management (Section 15)
3. Deploy CDN (Section 16)
4. Set up production infrastructure (Section 15)
5. Deploy and test in staging
6. Launch to production

**Estimated Effort**: 2-4 weeks for experienced DevOps team
