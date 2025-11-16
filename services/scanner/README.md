# Scanner Service (Node/TypeScript)

Stub Node service that will host the accessibility scanning engine.

## Getting Started
- Install dependencies at repo root: `npm install`
- Run locally (rebuilds first): `npx nx serve scanner`
- Run tests: `npx nx test scanner`
- Build production bundle: `npx nx build scanner`

## Next up
- Integrate Playwright/Puppeteer with axe-core to run real scans.
- Define input/output DTOs that align with `packages/domain`.
- Add healthcheck endpoints and configuration for target URLs.
