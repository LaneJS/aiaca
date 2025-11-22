Frontend Agent — Foundation: auth, API clients, and removal of mocks
Goal: Replace mock BillingDataService with real API wiring, authenticated routing, and shared UX primitives.
Scope:
- Implement auth (SSO-ready): token obtain/refresh, secure storage (avoid localStorage), HTTP interceptor for auth headers, global error handling, and role-based route guards (viewer/operator/admin) with redaction for read-only roles.
- Build typed API clients using DTOs from @aiaca/domain aligned to backend routes; centralize pagination/filter/sort helpers.
- Replace all mock data/services with live API calls; remove fallback/demo data paths.
- Add global loading + toast/alert patterns, error boundary surfaces, and empty/loading/unauthorized states.
- Ensure Angular best practices: standalone components, inject() for DI, provideRouter(), no NgModules, explicit imports per component.
Dependencies: Backend contracts from 02; coordinate with backend agent on route/field names. Sets foundation for subsequent UI features.
