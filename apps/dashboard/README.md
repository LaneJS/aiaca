# Dashboard (Angular)

Production-ready authenticated dashboard for the A11y Assistant product with onboarding, auth flow, site management, and scan insights.

## Architecture

### Routing & Authentication
- **Protected Routes:** `ShellComponent` wraps all authenticated pages (Overview, Sites, Scans, Script Setup, Account)
- **Auth Flow:** `/auth` handles login/signup plus password reset request + confirm flows aligned to backend error messages
- **Auth Guard:** Redirects unauthenticated or expired sessions to login with context + redirect intent
- **Auth Interceptor:** Automatically attaches JWT tokens, handles 401 redirects, and clears expired sessions

### State Management & Services
- **Auth Service:** Manages user session, token storage (sessionStorage with in-memory fallback), and authentication state using Angular signals
- **API Service:** Centralized HTTP client for all backend endpoints with proper error handling
- **Toast Service:** Global notification system for user feedback
- **No Mock Data:** All mock data and demo fallbacks removed for production

### Environment Configuration
- **Development:** `src/environments/environment.ts`
- **Production:** `src/environments/environment.prod.ts`
- **CDN URL:** Configurable via `environment.cdnBaseUrl`
- **API Base:** Configured via `environment.apiBaseUrl` and consumed by `AuthService` + `ApiService`

### UI Components
- **Error States:** Consistent error display with retry actions
- **Empty States:** User-friendly messages when no data exists
- **Loading States:** Spinners and skeleton loaders for all async operations
- **Toast Notifications:** Success/error feedback for all user actions

## API Integration

### Implemented Endpoints
All endpoints are built off `environment.apiBaseUrl` (no hardcoded paths):

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User signup
- `POST /auth/password-reset/request` - Request password reset link (backend implementation pending)
- `POST /auth/password-reset/confirm` - Confirm new password with reset token (backend implementation pending)

#### Sites
- `GET /sites` - List all user sites
- `GET /sites/:id` - Get site details
- `POST /sites` - Create new site
- `PATCH /sites/:id` - Update site (name, URL)
- `DELETE /sites/:id` - Delete site

#### Scans
- `GET /scans` - List all scans
- `GET /sites/:siteId/scans` - List scans for a site
- `GET /scans/:id` - Get scan details with issues
- `POST /sites/:siteId/scans` - Trigger new scan
- `PATCH /scans/:scanId/issues/:issueId` - Update issue status

### Backend Requirements
The following endpoints must be implemented by the backend API agent:
- `PATCH /sites/:id` - Update site details
- `DELETE /sites/:id` - Delete site
- `PATCH /scans/:scanId/issues/:issueId` - Update issue status (open/fixed)
- `POST /auth/password-reset/request` and `/auth/password-reset/confirm` - Needed for the new recovery flow
- `POST /auth/refresh` (or equivalent) - To enable silent token rotation instead of forced re-login

## Features

### Site Management
- Create sites with automatic initial scan
- Edit site name and URL
- Delete sites with confirmation dialog
- View site metrics and recent scans
- Comprehensive error handling with user-friendly messages

### Scan Management
- Trigger scans with real-time polling for status updates
- View scan results with accessibility issue breakdown
- Toggle issue status (open/fixed) with backend persistence
- Optimistic UI updates with rollback on error
- Loading indicators during scan execution

### Issue Tracking
- Mark issues as fixed/open with API persistence
- Changes survive page refresh
- Visual feedback for status updates
- Error recovery with automatic rollback

### Authentication & Recovery
- Login/signup backed by API with session-expired guard/interceptor messaging
- Password reset request + confirm flows with lockout/rate-limit messaging; shows fallback note if backend endpoint is unavailable
- Post-auth redirect preserves the originally requested route via `redirectTo` when the guard blocks access

### Script Setup
- Dynamic embed script generation
- Production CDN URL from environment config
- Copy to clipboard with success notification
- Site selection dropdown

## Token Storage Security

### Current Implementation
Tokens and user profile data are stored in `sessionStorage` with an in-memory fallback for non-browser contexts. JWT expiry is decoded to schedule auto-logout and redirect back to `/auth` with a session-expired reason and the attempted route.

### Refresh Strategy
No refresh endpoint exists yet. The dashboard currently forces re-login when tokens expire or a 401 is returned. Once the API exposes `/auth/refresh` (or equivalent), plan to switch to short-lived access tokens with a HttpOnly refresh token and silent refresh handled inside `AuthService`.

### Security Considerations
- **XSS Exposure:** `sessionStorage` remains script-accessible; keep CSP/audits tight
- **Idle Expiry:** Closing the tab clears the session; guard/interceptor preserve redirect intent to reduce friction
- **CSRF Protection:** If the backend moves to cookies, pair with CSRF tokens

### Future Enhancements
Consider implementing:
1. **HttpOnly Cookies:** Most secure; requires backend coordination for cookie issuance + CSRF protection
2. **Memory + Refresh Token:** Store access token in memory with refresh token in HttpOnly cookie
3. **Token Rotation:** Automatically refresh before expiration once backend endpoint exists

## Running & Testing

### Development
```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npx nx serve dashboard

# Run unit tests
npx nx test dashboard

# Run linter
npx nx lint dashboard
```

### Production Build
```bash
# Build for production
npx nx build dashboard --configuration=production

# Output: dist/apps/dashboard
# Serves production environment with proper file replacements
```

### Manual Testing Checklist
1. **User Signup:** Create account with real API (no demo fallback)
2. **User Login:** Authenticate with proper error handling
3. **Password Reset:** Request reset link and confirm new password (UI shows friendly fallback until backend endpoint ships)
4. **Add Site:** Create site, verify error messages for invalid input
5. **Edit Site:** Update site name/URL
6. **Delete Site:** Confirm deletion with modal
7. **Trigger Scan:** Start scan and verify polling updates
8. **View Scan Results:** See real data from backend
9. **Toggle Issue Status:** Mark issue fixed, verify persistence after refresh
10. **Copy Embed Script:** Copy production CDN URL
11. **Logout:** Clear session and redirect to login
12. **Session Expiry:** Allow token to expire or force a 401 to confirm redirect with session-expired notice
13. **Error Scenarios:** Test with network disconnected, API down, invalid data

## Error Handling

### Global Error Handling
- HTTP errors caught and displayed to users
- No silent failures - all errors show user-friendly messages
- Network errors prompt retry with explanation
- 401 errors trigger automatic logout and redirect

### Error Messages
- **Network Error:** "Unable to connect to server. Please check your internet connection."
- **401 Unauthorized:** "Invalid email or password" (or session-expired redirect for other requests)
- **429 Rate Limited:** "Too many attempts. Please wait and try again."
- **409 Conflict:** "An account with this email already exists"
- **500 Server Error:** "Server error. Please try again later."
- **Generic:** "An unexpected error occurred. Please try again."

## Production Readiness

### Completed
- All mock data removed
- Demo user fallback system eliminated
- Production environment configuration
- Proper error handling throughout
- Loading states for all async operations
- Toast notifications for all user actions
- Backend API integration
- Secure token management
- Production build succeeds
- All tests passing
- Linting passes with zero issues

### Known Limitations
- Password reset endpoints are not yet implemented on the backend; UI shows a friendly fallback until they ship
- Token refresh/rotation not yet available; JWT expiry forces re-login
- Some components show unused import warnings (components used conditionally based on state)
- Budget warning for nx-welcome component (not critical, can be removed if needed)

### Deployment Notes
1. Environment variables must be configured:
   - `apiBaseUrl`: Backend API endpoint
   - `cdnBaseUrl`: CDN for embed script
2. Backend must implement required endpoints (see API Integration section)
3. CORS must be configured on backend for dashboard origin
4. Consider implementing refresh token rotation for enhanced security
5. Set up monitoring/logging for production errors

## Troubleshooting

### Common Issues

**Login fails with network error:**
- Verify backend API is running and accessible
- Check CORS configuration on backend
- Verify `apiBaseUrl` in environment config

**Embed script shows wrong URL:**
- Check `cdnBaseUrl` in production environment config
- Verify production build uses correct environment file

**Token expires immediately:**
- Backend should return proper JWT with expiration
- Consider implementing refresh token mechanism

**Site operations fail:**
- Verify backend endpoints are implemented
- Check browser console for specific error messages
- Ensure user is authenticated (valid token)
