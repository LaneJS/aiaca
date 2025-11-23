# Section 14 – Service Integration (API ↔ Scanner ↔ AI Orchestrator)

You are the Backend API Agent collaborating with Scanner Engine and AI Orchestration Agents.

## Objective
Wire together the API service with Scanner and AI Orchestrator services so that real scans execute end-to-end instead of returning stub data. This section addresses the integration gap where the API currently returns hardcoded example data rather than calling downstream services.

## Deliverables
1. HTTP clients in `services/api` to call:
   - Scanner service at `POST /scan` (default: `http://scanner:4001/scan` or `http://localhost:4001/scan`)
   - AI Orchestrator service at `POST /suggest-fixes` (default: `http://ai-orchestrator:4002/suggest-fixes`)
2. Update `ScanService.java` to:
   - Replace hardcoded stub data in `createScan()` with real scanner service call
   - Replace hardcoded stub data in `createPublicScan()` with real scanner service call
   - Call AI orchestrator with scanner results to get suggestions
   - Map scanner results and AI suggestions to database entities (Scan, ScanIssue, AiSuggestion)
   - Persist real scan data to database
3. Configuration for service URLs:
   - Add `SCANNER_SERVICE_URL` and `AI_ORCHESTRATOR_SERVICE_URL` to application properties
   - Document in `.env.sample` and `services/api/README.md`
4. Error handling and resilience:
   - Timeout configuration for downstream service calls
   - Fallback behavior when scanner or AI orchestrator unavailable
   - Proper error messages to users when scans fail
5. Integration tests demonstrating:
   - Successful scan with real scanner + AI orchestrator calls
   - Graceful degradation when AI orchestrator is down (scan completes but no suggestions)
   - Proper error handling when scanner is unavailable
6. Update documentation:
   - `services/api/README.md` with integration architecture
   - Docker compose networking notes in `infra/README.md`
   - Update Section 14 checkboxes in new `todos.md` section

## Constraints & Guidance
- Use Spring `RestTemplate` or `WebClient` for HTTP client (WebClient preferred for async/reactive support)
- Maintain backward compatibility with database schema from Section 3
- Follow existing security patterns (URL sanitization, rate limiting)
- Log correlation IDs across service boundaries for debugging
- Consider implementing circuit breaker pattern (Resilience4j) for production resilience
- Keep scanner and AI orchestrator contracts loosely coupled (use DTOs from `packages/domain` if possible)

## Validation
- Start full stack via `docker-compose up`
- Submit a public scan request and verify:
  - Scanner service logs show scan execution
  - AI orchestrator logs show suggestion generation (if Gemini key configured)
  - Database contains real scan results (not stub data)
  - API response includes actual issues from scanner
- Test with AI orchestrator in stub mode (`AI_ORCHESTRATOR_USE_STUB=true`)
- Test error scenarios (stop scanner, verify graceful failure)

## Output Expectations
Respond with:
1. Summary of integration architecture and HTTP client implementation
2. Configuration examples showing service URL setup
3. Testing evidence (curl commands, service logs, database queries showing real scan data)
4. File references for:
   - HTTP client implementations
   - Updated ScanService.java
   - Configuration files
   - Integration tests
5. Known limitations or future improvements needed
