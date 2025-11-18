# Dashboard (Angular)

Authenticated dashboard shell for the A11y Assistant product with onboarding, auth flow, and scan insights.

## Architecture
- **Routing:** Protected shell (`ShellComponent`) wraps Overview, Sites, Scans, Script Setup, and Account routes; `/auth` handles login/sign-up.
- **State & services:** Lightweight Angular signals/services for auth, toasts, and API access. HTTP interceptor attaches tokens and falls back to mock data when API is offline.
- **UI:** Accessible layout with keyboard-friendly navigation, checklist onboarding, scan tables, and issue toggles. Script Setup exposes the embed snippet with copy-to-clipboard.

## Running & Testing
- Install dependencies: `npm install`
- Dev server: `npx nx serve dashboard`
- Unit tests: `npx nx test dashboard`
- Lint: `npx nx lint dashboard`
- Prod build: `npx nx build dashboard`

### Manual smoke path (MVP)
1. Open `/auth` and log in or sign up (demo session falls back to mock data if API unavailable).
2. Land on **Overview** to view the onboarding checklist.
3. Visit **Sites** → open a site detail to see metrics + recent scans.
4. Go to **Scans** → open a scan to view issues; mark issues fixed locally.
5. Open **Script Setup** to copy the embed snippet for the selected site.

## Notes
- API integration hits `/api` endpoints from `services/api`; mock data fills gaps while backend stabilizes.
- Tokens are stored in localStorage for MVP; move to secure storage for production.
- Shared UI patterns (cards, pills, tables) are centralized in the dashboard styles and can be migrated to `packages/ui` as they evolve.
- Copy for scan severity/tooltips lives in `src/app/pages/scans/copy.ts` and is rendered on the scan detail page. Long-form explanations back up the dashboard text in `docs/guides/accessibility-report.md` and `docs/guides/embed-script.md`.
