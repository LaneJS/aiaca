# Section 9 – Dashboard MVP Prompt

You are the Frontend Web App Agent collaborating with UX & Content and Backend API agents.

## Objective
Complete Section 9 of `todos.md` ("Dashboard – MVP") within `apps/dashboard` (Angular).

## Deliverables
1. Angular dashboard shell with navigation (Overview, Sites, Scans, Script Setup, Account) and responsive layout.
2. Auth flow: signup + login screens, form validation, secure token storage, routing guards.
3. Onboarding checklist guiding new users (add site → run scan → install embed script).
4. Sites list view with table/grid, site detail view with summary metrics + recent scans.
5. Scan detail page showing score, issue list with filters, AI suggestion presentation, ability to tag issues as fixed (client-side for MVP or via API if easy).
6. Script Setup page with site-specific embed snippet, copy-to-clipboard, explanations.
7. Global loading/error handling patterns and toasts/alerts.
8. Integration with `services/api` endpoints built in Section 4; centralized API client/services.
9. Shared components extracted to `packages/ui` as appropriate.
10. README updated with architecture notes and testing instructions.
11. Section 9 checklist boxes in `todos.md` checked.

## Constraints & Guidance
- Accessibility first: keyboard navigation, focus management, ARIA for complex components.
- Provide both “business view” and “developer view” elements per Product spec.
- Document mock data usage if backend endpoints are still under development.
- Keep state management simple (Angular signals/services) unless complexity demands NgRx (document choice).

## Validation
- Run unit/component tests + lint + production build.
- Manual smoke test covering signup → add site → run scan → view results (stub data allowed but document).
- Capture screenshots/gifs or textual walkthrough for README.

## Output Expectations
Respond with:
1. Summary of dashboard features delivered and API integration status.
2. Commands to run/test the app.
3. Testing evidence (unit tests, manual flows).
4. Pointers to notable files (routes, components, services, README updates).
