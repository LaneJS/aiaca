# API Service (Spring Boot)

Spring Boot skeleton for the AACA backend API.

## Getting Started
- Install Node/Angular deps at root for Nx tooling: `npm install`
- Build the service: `npx nx build api`
- Run tests: `npx nx test api`
- Launch the app locally: `npx nx serve api`
- If the Gradle wrapper JAR is missing (binary files are ignored), regenerate it with a locally installed Gradle: `gradle wrapper --gradle-version 8.7`.

## Next up
- Add domain models and controllers for the MVP endpoints listed in `todos.md`.
- Configure database connectivity and migrations (Flyway/Liquibase).
- Expose a `/health` endpoint for local dev and uptime monitoring.
