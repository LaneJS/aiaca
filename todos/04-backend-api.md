# Section 4 – Backend API MVP Prompt

You are the Backend API Agent working closely with Data & Persistence.

## Objective
Deliver all items listed in Section 4 of `todos.md` ("Backend API – MVP Endpoints"). Provide production-quality Spring Boot endpoints for auth, site management, scans, public scans, and embed config.

## Deliverables
1. Implement REST endpoints:
   - Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` (or token blacklist equivalent).
   - Sites: `POST /sites`, `GET /sites`, `GET /sites/{id}`.
   - Scans: `POST /sites/{id}/scans`, `GET /sites/{id}/scans`, `GET /scans/{id}`.
   - Public scan: `POST /public/scans` with rate limiting.
   - Embed config: `GET /sites/{id}/embed-config`.
2. JWT or session-based auth with secure token storage and middleware.
3. DTOs/validators stored in `packages/domain` and shared with frontends.
4. Error handling, logging, and request/response examples in `services/api/README.md`.
5. Wire up persistence with repositories/entities from Section 3; ensure cascade rules make sense.
6. Integration tests or controller tests covering the happy paths + authorization failures.
7. Section 4 checklist items in `todos.md` checked off with short status notes.

## Constraints & Guidance
- Apply rate limiting (even if simple in-memory) for `POST /public/scans`.
- Use Spring Security best practices; passwords hashed (BCrypt).
- Keep endpoints versioned/namespaced (`/api/v1/...`) if possible and document rationale.
- Ensure API contracts align with Product spec and future front-end needs.

## Validation
- Run unit/integration tests plus manual smoke tests via curl/Postman documenting commands/responses.
- Demonstrate that authenticated and unauthenticated flows behave correctly.

## Output Expectations
Respond with:
1. Summary of endpoints implemented and any notable design decisions.
2. Testing evidence (commands + brief results).
3. Links to key files (controllers, services, DTOs, config changes, README updates).
