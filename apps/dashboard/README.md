# Dashboard (Angular)

Production-ready authenticated dashboard for the A11y Assistant product with onboarding, auth flow, site management, and scan insights.

## Architecture

### Routing & Authentication
- **Protected Routes:** `ShellComponent` wraps all authenticated pages (Overview, Sites, Scans, Script Setup, Account)
- **Auth Flow:** `/auth` route handles login/signup with real backend integration
- **Auth Guard:** Redirects unauthenticated users to login
- **Auth Interceptor:** Automatically attaches JWT tokens and handles 401 redirects

### State Management & Services
- **Auth Service:** Manages user session, token storage (localStorage), and authentication state using Angular signals
- **API Service:** Centralized HTTP client for all backend endpoints with proper error handling
- **Toast Service:** Global notification system for user feedback
- **No Mock Data:** All mock data and demo fallbacks removed for production

### Environment Configuration
- **Development:** `src/environments/environment.ts`
- **Production:** `src/environments/environment.prod.ts`
- **CDN URL:** Configurable via `environment.cdnBaseUrl`
- **API Base:** Configured via `environment.apiBaseUrl`

### UI Components
- **Error States:** Consistent error display with retry actions
- **Empty States:** User-friendly messages when no data exists
- **Loading States:** Spinners and skeleton loaders for all async operations
- **Toast Notifications:** Success/error feedback for all user actions

## API Integration

### Implemented Endpoints
All endpoints use real backend integration (no mock data):

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User signup

#### Sites
- `GET /api/v1/sites` - List all user sites
- `GET /api/v1/sites/:id` - Get site details
- `POST /api/v1/sites` - Create new site
- `PATCH /api/v1/sites/:id` - Update site (name, URL)
- `DELETE /api/v1/sites/:id` - Delete site

#### Scans
- `GET /api/v1/scans` - List all scans
- `GET /api/v1/sites/:siteId/scans` - List scans for a site
- `GET /api/v1/scans/:id` - Get scan details with issues
- `POST /api/v1/sites/:siteId/scans` - Trigger new scan
- `PATCH /api/v1/scans/:scanId/issues/:issueId` - Update issue status

### Backend Requirements
The following endpoints must be implemented by the backend API agent:
- `PATCH /api/v1/sites/:id` - Update site details
- `DELETE /api/v1/sites/:id` - Delete site
- `PATCH /api/v1/scans/:scanId/issues/:issueId` - Update issue status (open/fixed)

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

### Script Setup
- Dynamic embed script generation
- Production CDN URL from environment config
- Copy to clipboard with success notification
- Site selection dropdown

## Token Storage Security

### Current Implementation
Tokens are stored in localStorage with user profile data. This is suitable for MVP but has known security limitations.

### Security Considerations
- **XSS Vulnerability:** localStorage is accessible to JavaScript, making it vulnerable to XSS attacks
- **Production Recommendation:** Implement HttpOnly cookies or memory-only storage with refresh tokens
- **CSRF Protection:** If using cookies, implement CSRF token validation

### Future Enhancements
Consider implementing:
1. **HttpOnly Cookies:** Most secure, requires backend coordination for cookie management
2. **Memory + Refresh Token:** Store access token in memory, refresh token in HttpOnly cookie
3. **Token Rotation:** Implement automatic token refresh before expiration

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
3. **Add Site:** Create site, verify error messages for invalid input
4. **Edit Site:** Update site name/URL
5. **Delete Site:** Confirm deletion with modal
6. **Trigger Scan:** Start scan and verify polling updates
7. **View Scan Results:** See real data from backend
8. **Toggle Issue Status:** Mark issue fixed, verify persistence after refresh
9. **Copy Embed Script:** Copy production CDN URL
10. **Logout:** Clear session and redirect to login
11. **Error Scenarios:** Test with network disconnected, API down, invalid data

## Error Handling

### Global Error Handling
- HTTP errors caught and displayed to users
- No silent failures - all errors show user-friendly messages
- Network errors prompt retry with explanation
- 401 errors trigger automatic logout and redirect

### Error Messages
- **Network Error:** "Unable to connect to server. Please check your internet connection."
- **401 Unauthorized:** "Invalid email or password" (or auto-logout for other requests)
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
- Token storage uses localStorage (acceptable for MVP, should upgrade for production scale)
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
