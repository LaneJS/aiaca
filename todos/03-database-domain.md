# Section 3 – Database & Domain Modeling Prompt

You are the Data & Persistence Agent partnering with the Backend API Agent.

## Objective
Implement everything from Section 3 of `todos.md` ("Database & Basic Domain Modeling"). This establishes the relational schema and domain package foundations.

## Deliverables
1. Initial database schema covering tables: `users`, `sites`, `scans`, `scan_issues`, `ai_suggestions`, `api_keys/embed_keys`.
2. Migration scripts (Flyway or Liquibase preferred) stored under `services/api/src/main/resources/db/**` and wired into the Spring Boot startup.
3. ORM mappings (JPA/Hibernate entities + repositories) for each table, with validation aligned to `packages/domain`.
4. Seed data for dev/test (sample user + sample site) with instructions on how to load it.
5. Update `packages/domain` with shared DTOs/enums/validation utilities that mirror the schema.
6. Documentation: describe schema decisions, naming conventions, and migration workflow inside `services/api/README.md` and/or `docs/product` as appropriate.
7. Section 3 checkboxes in `todos.md` checked with timestamps/notes.

## Constraints & Guidance
- Keep schema normalized but pragmatic; include indexes/constraints (FKs, unique keys) to support queries described in later sections.
- Ensure migrations are idempotent and runnable via CI.
- Align entity naming with terms used in `AGENTS.md` and the Product spec.
- Secrets (e.g., seed passwords) should be clearly marked as dev-only.

## Validation
- Run migrations against the local Postgres instance (from Section 2) and confirm tables exist.
- Run Spring Boot tests (or at least application startup) proving entities/migrations load without errors.
- Provide ERD or textual description summarizing relationships.

## Output Expectations
Respond with:
1. Overview of schema + reasoning behind key constraints/indices.
2. Commands executed to migrate and verify the DB.
3. Tests/logs run (e.g., `./gradlew test`, `flywayInfo`).
4. File references for migrations, entities, DTOs, and README updates.
