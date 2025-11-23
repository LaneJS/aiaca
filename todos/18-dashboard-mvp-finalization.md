# Section 18 – Dashboard MVP Production Finalization

You are the Frontend Web App Agent collaborating with the Backend API Agent.

## Objective
Finalize the Angular dashboard (`apps/dashboard`) for MVP production launch by removing all demo/mock data, completing partial implementations, and ensuring proper backend integration. The dashboard must be production-ready with zero placeholder content, robust error handling, and complete feature implementations.

## Context
The Section 9 dashboard implementation established the core architecture and UI, but includes significant mock data, demo user fallbacks, and incomplete features. Based on comprehensive codebase analysis, the following areas require finalization before production launch.

## Critical Issues Identified

### Mock Data & Hardcoded Test Data
**File: `apps/dashboard/src/app/core/api.service.ts`**
- Lines 39-62: 2 hardcoded mock sites ("Sunrise Coffee", "Northwind Bikes")
- Lines 64-84: 2 hardcoded mock scans with example data
- Lines 86-128: Complete mock scan detail with 3 hardcoded accessibility issues
- All API endpoints have `.pipe(catchError(() => of(mockData)))` fallbacks that silently serve mock data

### Demo User Fallback System
**Files: `auth.service.ts`, `shell.component.ts`, `auth.component.ts`**
- Auto-creates demo user (`demo@aaca.dev`) when token exists but no user session
- Auth failures automatically fall back to demo session without user awareness
- `ensureDemoSession()` called on shell initialization
- Users cannot distinguish between real login and demo mode

### Incomplete Features
1. **Issue Status Toggle** (`scan-detail.component.ts:38-40`): Changes not persisted to backend
2. **Scan Progress**: No polling or loading states for running scans
3. **Token Storage** (`account.component.html:8`): Insecure localStorage with explicit MVP warning
4. **CDN URL** (`script-setup.component.ts:27`): Hardcoded placeholder `https://cdn.A11yAssistant.com/autofix.js`

## Deliverables

### 1. Remove All Mock Data & Fallbacks
- [ ] Remove `mockSites()`, `mockScans()`, and `mockScanDetail()` functions from `api.service.ts`
- [ ] Remove all `.pipe(catchError(() => of(mockData)))` fallbacks from API calls
- [ ] Implement proper error handling that displays user-friendly messages
- [ ] Create error states for each view (empty states, error messages, retry actions)
- [ ] Ensure no hardcoded example data remains in any component or service

### 2. Eliminate Demo User System
- [ ] Remove `ensureDemoSession()` from `auth.service.ts` (lines 53-57)
- [ ] Remove auto-demo fallback from `auth.component.ts` (lines 37-41)
- [ ] Remove `ensureDemoSession()` call from `shell.component.ts` (line 32)
- [ ] Implement proper auth error states:
  - Invalid credentials → clear error message
  - Network error → retry option with error explanation
  - Session expired → redirect to login with context message
- [ ] Add explicit "Try Demo" button on login page if demo mode is desired (optional feature)
- [ ] Ensure auth failures show meaningful errors instead of silently switching to demo

### 3. Complete Partial Implementations

#### Issue Status Toggle (HIGH PRIORITY)
- [ ] Add `updateIssueStatus(scanId: string, issueId: string, status: string)` to `api.service.ts`
- [ ] Implement backend endpoint `PATCH /api/v1/scans/{scanId}/issues/{issueId}` (coordinate with Backend API Agent)
- [ ] Update `scan-detail.component.ts` `toggle()` method to call API
- [ ] Add optimistic UI update with rollback on error
- [ ] Show loading indicator during API call
- [ ] Display success/error toast after status change

#### Scan Progress & Polling
- [ ] Add `getScanStatus(scanId: string)` to `api.service.ts`
- [ ] Implement polling mechanism in `overview.component.ts` when scan is triggered
- [ ] Add loading spinner and status message ("Scanning...", "Processing results...")
- [ ] Auto-refresh scan list when scan completes
- [ ] Handle scan failures gracefully (timeout, URL unreachable, etc.)
- [ ] Add "Cancel Scan" option if backend supports it

#### Site Management
- [ ] Add `updateSite(siteId: string, updates: Partial<Site>)` to `api.service.ts`
- [ ] Add `deleteSite(siteId: string)` to `api.service.ts`
- [ ] Implement edit site functionality in `sites.component.ts`
- [ ] Add delete site with confirmation dialog
- [ ] Refresh site list after create/update/delete operations
- [ ] Handle errors gracefully (show error toast, don't clear form on network error)

### 4. Production Configuration

#### Token Storage Security
- [ ] Research and implement secure token storage for Angular SPA:
  - Option A: HttpOnly cookies (requires backend coordination)
  - Option B: Memory-only storage with refresh token pattern
  - Option C: Encrypted localStorage with key rotation
- [ ] Document chosen approach and security tradeoffs in `apps/dashboard/README.md`
- [ ] Update `auth.interceptor.ts` to use new storage mechanism
- [ ] Remove "insecure storage" warning from `account.component.html`
- [ ] Implement automatic token refresh before expiration

#### CDN URL Configuration
- [ ] Replace hardcoded CDN URL in `script-setup.component.ts` with environment variable
- [ ] Add `cdnBaseUrl` to `environment.ts` and `environment.prod.ts`
- [ ] Update embed script template to use dynamic URL: `${environment.cdnBaseUrl}/autofix.js`
- [ ] Add fallback URL or error message if CDN is unreachable
- [ ] Document CDN configuration in setup instructions

### 5. Error Handling & Loading States

#### Global Error Handling
- [ ] Create `ErrorStateComponent` for consistent error display
- [ ] Create `EmptyStateComponent` for "no data" scenarios
- [ ] Implement error boundary pattern for component-level errors
- [ ] Add global error handler for uncaught exceptions
- [ ] Log errors to observability system (if available)

#### Loading States
- [ ] Add loading spinners to all async operations:
  - Site list loading
  - Scan list loading
  - Scan detail loading
  - Triggering new scan
  - Site creation
  - Issue status updates
- [ ] Disable action buttons while operations are in progress
- [ ] Add skeleton loaders for better perceived performance

#### User Feedback
- [ ] Ensure all success/error operations show toast notifications
- [ ] Add success messages for:
  - Site created
  - Scan triggered
  - Issue marked as fixed
  - Settings saved
- [ ] Add error messages for:
  - Network failures
  - API errors (4xx, 5xx)
  - Validation failures
  - Timeout scenarios

### 6. Backend Integration Verification
- [ ] Verify all API endpoints are implemented and functional:
  - `GET /api/v1/sites` - list user's sites
  - `POST /api/v1/sites` - create new site
  - `GET /api/v1/sites/:id` - get site details
  - `PATCH /api/v1/sites/:id` - update site (if not exists, coordinate with Backend API Agent)
  - `DELETE /api/v1/sites/:id` - delete site (if not exists, coordinate with Backend API Agent)
  - `GET /api/v1/scans` - list scans (filtered by siteId)
  - `POST /api/v1/scans` - trigger new scan
  - `GET /api/v1/scans/:id` - get scan details
  - `PATCH /api/v1/scans/:scanId/issues/:issueId` - update issue status (NEW - coordinate with Backend API Agent)
- [ ] Test each endpoint with real backend (not mock data)
- [ ] Document any missing endpoints needed from backend
- [ ] Create API integration test suite

### 7. Code Quality & Cleanup
- [ ] Remove all TODO comments from code
- [ ] Remove unused imports and dead code
- [ ] Ensure all components have proper TypeScript types (no `any`)
- [ ] Run linter and fix all issues: `npm run lint`
- [ ] Run tests and ensure 100% pass rate: `npm run test`
- [ ] Run production build and verify no errors: `npm run build`
- [ ] Check bundle size and optimize if necessary

### 8. Testing & Validation
- [ ] Unit tests for all new/modified services (aim for 80%+ coverage)
- [ ] Component tests for critical user flows
- [ ] Integration tests for API service
- [ ] Manual testing checklist:
  - [ ] User signup flow (real API, no demo fallback)
  - [ ] User login flow (real API, proper error handling)
  - [ ] Add site flow (success and error cases)
  - [ ] Trigger scan flow (with polling until completion)
  - [ ] View scan results (real data from backend)
  - [ ] Toggle issue status (persists to backend)
  - [ ] Copy embed script (production CDN URL)
  - [ ] Logout and session management
  - [ ] Error scenarios (network disconnected, API down, invalid data)
- [ ] Accessibility audit (use axe DevTools, aim for zero violations)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing

### 9. Documentation Updates
- [ ] Update `apps/dashboard/README.md` with:
  - Current architecture (no more mock data)
  - API integration details
  - Token storage approach
  - Environment configuration
  - Known limitations or future enhancements
- [ ] Document any breaking changes or migration steps
- [ ] Update testing instructions
- [ ] Add troubleshooting section for common issues

### 10. Deployment Readiness
- [ ] Create production environment configuration (`environment.prod.ts`)
- [ ] Verify all environment variables are documented
- [ ] Test production build locally: `npm run build && npx http-server dist/apps/dashboard`
- [ ] Verify no console errors or warnings in production build
- [ ] Check that no development tools or mock data are included in production bundle
- [ ] Document deployment process in `apps/dashboard/README.md`

## Constraints & Guidance

### Required Coordination
- **Backend API Agent**: Several features require new backend endpoints. Coordinate on:
  - `PATCH /api/v1/sites/:id` - update site
  - `DELETE /api/v1/sites/:id` - delete site
  - `PATCH /api/v1/scans/:scanId/issues/:issueId` - update issue status
  - `GET /api/v1/scans/:id/status` - poll scan progress (if separate endpoint)
  - Token refresh endpoint (if using refresh token pattern)

### Security Considerations
- Never log tokens or sensitive data to console
- Sanitize all error messages (don't expose internal details)
- Validate all user input on frontend (additional to backend validation)
- Implement CSRF protection if using cookies for auth
- Add rate limiting for sensitive actions (login, signup)

### User Experience Principles
- No silent failures - always inform user of errors
- Provide actionable error messages ("Try again" vs "An error occurred")
- Show loading states for operations taking >500ms
- Optimistic UI updates where appropriate (with rollback on error)
- Maintain user context (don't clear forms on network errors)

## Validation Checklist

Before marking this section complete, verify:
- [ ] Zero mock data exists in any production code path
- [ ] No demo user fallback in production build
- [ ] All API calls properly integrated and tested with real backend
- [ ] Issue status toggle persists to backend and survives page refresh
- [ ] Production CDN URL configured via environment variable
- [ ] Token storage meets security requirements for MVP
- [ ] All loading states implemented and tested
- [ ] All error states show user-friendly messages with retry options
- [ ] Linting passes with zero issues
- [ ] All tests pass with good coverage
- [ ] Production build completes without errors or warnings
- [ ] Manual testing checklist 100% complete
- [ ] Accessibility audit shows zero critical issues
- [ ] Documentation updated and accurate
- [ ] Backend integration verified end-to-end
- [ ] No TODO comments remain in code
- [ ] No console.log statements in production code

## Output Expectations

Respond with:
1. Summary of changes made (categorized by deliverable section)
2. Evidence of testing:
   - Test coverage report
   - Manual testing results (screenshots or detailed walkthrough)
   - Accessibility audit results
   - Production build success
3. API integration status:
   - Which endpoints are fully integrated
   - Which endpoints required backend changes (document what was added)
   - Any outstanding backend work needed
4. Security implementation details:
   - Token storage approach chosen and rationale
   - Security measures implemented
5. File references for all modified files
6. Outstanding items or known limitations (if any)
7. Deployment readiness assessment

## Success Criteria

This section is complete when:
- ✅ Zero mock data in production code
- ✅ No demo user fallback system
- ✅ All API endpoints properly integrated
- ✅ Issue status changes persist to backend
- ✅ Production CDN URL configured
- ✅ Secure token storage implemented
- ✅ Comprehensive error handling and loading states
- ✅ All tests passing with good coverage
- ✅ Production build successful
- ✅ Manual testing 100% complete
- ✅ Documentation updated
- ✅ Ready for production deployment
