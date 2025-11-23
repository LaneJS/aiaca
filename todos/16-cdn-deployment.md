# Section 16 – CDN Deployment for Embed Script

You are the DevOps & Infra Agent collaborating with the Embed Script Agent.

## Objective
Deploy the auto-fix embed script (`packages/embed-script/dist/autofix.js`) to a production CDN so customer websites can include it via `<script src="https://cdn.A11yAssistant.com/autofix.js">`. This makes the embed script available, performant, and reliable for production use.

## Deliverables

### 1. CDN Selection & Setup
- [ ] Choose CDN provider:
  - **Option A**: Cloudflare (free tier available, simple setup)
  - **Option B**: AWS CloudFront (integrates with S3, full AWS ecosystem)
  - **Option C**: Google Cloud CDN (integrates with Cloud Storage, Vertex AI)
  - **Option D**: Fastly or other specialized CDN
- [ ] Document choice and rationale in `infra/README.md`
- [ ] Configure CDN distribution with:
  - Origin: Cloud storage bucket or object storage
  - Custom domain: `cdn.A11yAssistant.com`
  - TLS certificate for HTTPS
  - Cache headers (long TTL with versioning strategy)

### 2. Storage Backend
- [ ] Set up origin storage:
  - **AWS**: S3 bucket with CloudFront distribution
  - **GCP**: Cloud Storage bucket with Cloud CDN
  - **Cloudflare**: R2 or Pages
- [ ] Configure bucket policies for public read access to embed script only
- [ ] Implement versioning strategy (see below)

### 3. Build & Deployment Pipeline
- [ ] Update CI/CD to build embed script:
  ```bash
  npx nx build embed-script --configuration=production
  ```
- [ ] Generate production bundle with:
  - Minification
  - Source maps (optional, for debugging)
  - Integrity hash for SRI (Subresource Integrity)
- [ ] Upload to CDN on:
  - Every merge to main → `https://cdn.A11yAssistant.com/autofix-latest.js`
  - Tagged releases → `https://cdn.A11yAssistant.com/autofix-v1.2.3.js`
- [ ] Document deployment process in `packages/embed-script/README.md`

### 4. Versioning Strategy
Implement one of these patterns:
- [ ] **Semantic versioning** (recommended):
  - `https://cdn.A11yAssistant.com/autofix-v1.0.0.js` (pinned version)
  - `https://cdn.A11yAssistant.com/autofix-v1.js` (major version, auto-updates)
  - `https://cdn.A11yAssistant.com/autofix-latest.js` (always latest, for testing)
- [ ] **Hash-based versioning**:
  - `https://cdn.A11yAssistant.com/autofix-abc123def.js` (content hash)
- [ ] Update dashboard "Script Setup" page to show version selector
- [ ] Document versioning policy for customers

### 5. Cache Configuration
- [ ] Set cache headers:
  - Versioned URLs: `Cache-Control: public, max-age=31536000, immutable`
  - Latest/unversioned: `Cache-Control: public, max-age=3600`
- [ ] Configure cache invalidation process for emergency updates
- [ ] Test cache behavior across CDN edge locations

### 6. Security & Performance
- [ ] Enable HTTPS only (no HTTP fallback)
- [ ] Configure CORS headers to allow embedding from any domain:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  ```
- [ ] Enable Brotli and Gzip compression
- [ ] Set security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
- [ ] Generate SRI hash and document in embed snippet:
  ```html
  <script src="https://cdn.A11yAssistant.com/autofix-v1.0.0.js"
          integrity="sha384-abc123..."
          crossorigin="anonymous"></script>
  ```

### 7. Monitoring & Analytics
- [ ] Set up CDN analytics to track:
  - Number of requests per day
  - Bandwidth usage
  - Cache hit ratio
  - Geographic distribution of requests
- [ ] Configure alerts for:
  - High error rates (4xx, 5xx)
  - Unusual traffic spikes
  - Cache hit ratio drops
- [ ] Document monitoring dashboard location

### 8. Documentation Updates
- [ ] Update `packages/embed-script/README.md` with:
  - Production CDN URLs
  - Versioning policy
  - How to test before deploying
  - Rollback procedures
- [ ] Update dashboard "Script Setup" page with:
  - Copy-paste snippet using production CDN URL
  - Version selector (latest vs pinned)
  - SRI hash option
- [ ] Update `docs/guides/embed-script.md` with production instructions
- [ ] Add CDN deployment steps to deployment runbook

### 9. Testing & Validation
- [ ] Test embed script from CDN on sample sites:
  - Static HTML site
  - WordPress site
  - SPA (React/Angular/Vue)
- [ ] Verify functionality:
  - Script loads successfully
  - Alt text injection works
  - Skip link appears
  - Focus outline patch applies
  - Embed config fetched from API
- [ ] Test cache behavior (verify long TTL on versioned URLs)
- [ ] Test SRI verification
- [ ] Test from multiple geographic locations

### 10. Rollback Plan
- [ ] Document rollback procedure:
  - How to revert to previous version
  - How to invalidate CDN cache
  - Emergency contacts for CDN provider
- [ ] Test rollback in staging environment
- [ ] Create runbook for CDN incidents

## Constraints & Guidance
- Keep embed script bundle size minimal (target: <50KB gzipped)
- Never break existing customer sites (maintain backward compatibility)
- Use semantic versioning for predictable updates
- Prefer managed CDN services over self-hosted
- Document costs and bandwidth limits
- Consider multi-CDN strategy for redundancy (future enhancement)

## Validation
- [ ] Deploy embed script to staging CDN (`cdn-staging.aaca.test`)
- [ ] Verify script loads from CDN with correct headers
- [ ] Test on sample customer site
- [ ] Check cache hit ratio after multiple requests
- [ ] Verify TLS certificate is valid
- [ ] Test version switching (v1.0.0 vs latest)
- [ ] Confirm SRI hash validation works
- [ ] Load test CDN (simulate traffic spike)

## Output Expectations
Respond with:
1. Summary of CDN provider choice and setup
2. Production CDN URLs and versioning scheme
3. Build and deployment pipeline description
4. Cache configuration and performance metrics
5. Testing evidence:
   - curl commands showing headers
   - Sample HTML page using CDN script
   - Screenshots of script working
   - CDN analytics dashboard
6. File references for:
   - CI/CD updates
   - README updates
   - Dashboard snippet updates
   - Deployment runbook
7. Cost estimates and bandwidth projections
8. Known limitations or future improvements
