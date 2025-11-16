# Domain Package

Shared DTOs and domain models across services and frontend apps.

## Getting Started
- Run tests: `npx nx test domain`
- Build artifacts: `npx nx build domain`

## Current contents
- Shared enums for scan status, issue severity/status, and key/suggestion types.
- DTO schemas for users, sites, scans, scan issues, AI suggestions, API keys, and embed keys.
- Zod-based validation helpers that mirror the Spring Boot JPA models and Flyway schema.

## Next up
- Publish types for consumption in Node and Angular targets.
- Extend validation to cover reporting/export payloads.
