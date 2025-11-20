# AACA Embed Script Demo Site

An interactive demonstration website showcasing the AACA (AI Accessibility Compliance Assistant) embed script in action.

## Overview

This demo site is designed to showcase how the AACA embed script (`autofix.js`) automatically fixes accessibility issues on websites. It features a toggle control that allows users to see the before/after difference when the script is enabled.

## Features

- **Interactive Toggle**: Turn the embed script on/off to see real-time accessibility fixes
- **Intentional Accessibility Issues**: Demo content includes common issues like:
  - Missing alt text on images
  - Removed focus indicators
  - Missing skip navigation link
- **Real Backend Integration**: Uses actual API endpoints to fetch AI-generated alt text suggestions
- **Pre-configured Demo Data**: Includes a demo site with completed scan results in the database

## Accessing the Demo

### Local Development

**URL**: http://localhost:4400

**Prerequisites**:
- Docker and Docker Compose installed
- All services running (API, database, demo-site)

**Start the demo**:
```bash
docker-compose up -d demo-site
```

This will automatically start:
- PostgreSQL database (port 5432)
- API service (port 8080)
- Demo site (port 4400)

### Using the Demo

1. **Navigate to** http://localhost:4400
2. **Observe** the page has 4 images without alt text and no focus indicators
3. **Click the toggle** to enable the embed script
4. **Inspect the page** to see:
   - Alt text attributes added to images
   - Focus outlines visible when tabbing through links
   - Skip link appears at the top of the page
5. **Toggle OFF** to reload the page and remove the fixes

## Demo Site Configuration

**Fixed Database IDs** (for consistency across environments):

- **Site ID**: `00000000-0000-0000-0000-000000000001`
- **Embed Key**: `demo-embed-key-12345`
- **User ID**: `00000000-0000-0000-0000-000000000000`
- **Scan ID**: `00000000-0000-0000-0000-000000000010`

**Demo Images** (with intentional missing alt text):

1. `.site-logo` - Site logo in header
2. `img.hero-image` - Hero banner image
3. `#feature-automation` - Automated scanning feature image
4. `#feature-monitoring` - Real-time monitoring feature image

**AI-Generated Alt Text Suggestions**:

- **Hero Image**: "Modern office workspace with laptop"
- **Feature Automation**: "Automated scanning with AI"
- **Feature Monitoring**: "Real-time monitoring dashboard"
- **Site Logo**: "AACA logo - AI accessibility assistant"

## Technical Architecture

### Frontend

- **Framework**: Angular 20 (standalone components with signals)
- **Build Tool**: Nx monorepo
- **Server**: Nginx (in Docker)
- **Port**: 4400

### Backend Integration

- **API Endpoint**: `/api/v1/sites/{siteId}/embed-config`
- **Authentication**: `X-Embed-Key` header
- **Response**: Returns alt text suggestions and configuration

### Docker Configuration

**Dockerfile**: Multi-stage build
1. Build Angular app with Nx
2. Copy dist to Nginx image
3. Copy `autofix.js` from embed-script package

**Nginx**: Serves both the Angular app and the embed script at `/autofix.js`

## Database Seed Data

The demo site uses pre-seeded database records created during deployment:

**Seeding Method**:
Manual SQL inserts are executed against the running PostgreSQL database to create:
- Demo user
- Demo site with embed key
- Completed scan with accessibility score
- 4 scan issues with AI-generated alt text suggestions

**Verify Seed Data**:
```bash
# Check demo site exists
docker exec aaca-postgres psql -U aaca -d aaca -c \
  "SELECT id, name, embed_key FROM sites WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;"

# Check scan issues
docker exec aaca-postgres psql -U aaca -d aaca -c \
  "SELECT selector, LEFT(suggestion, 50) FROM scan_issues WHERE scan_id = '00000000-0000-0000-0000-000000000010'::uuid;"

# Test embed-config API
curl -X GET "http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config" \
  -H "X-Embed-Key: demo-embed-key-12345" | jq
```

## Development

### Project Structure

```
apps/demo-site/
├── src/
│   ├── app/
│   │   ├── app.component.ts           # Root component
│   │   ├── app.component.html         # Demo content
│   │   ├── app.component.scss         # Styles
│   │   ├── app.routes.ts              # Routes (empty for single page)
│   │   └── components/
│   │       └── script-toggle.component.ts  # Toggle control
│   ├── environments/
│   │   ├── environment.ts             # Dev config
│   │   └── environment.prod.ts        # Prod config
│   ├── index.html                     # Entry point
│   ├── main.ts                        # Bootstrap
│   └── styles.scss                    # Global styles with intentional a11y issues
├── public/
│   └── images/                        # Demo SVG placeholders
├── nginx.conf                         # Nginx configuration
├── Dockerfile                         # Multi-stage build
├── project.json                       # Nx project config
└── README.md                          # This file
```

### Build Commands

**Local build** (requires Node.js):
```bash
npx nx build demo-site --configuration=production
```

**Docker build**:
```bash
docker-compose build demo-site
```

**Run locally** (without Docker):
```bash
npx nx serve demo-site
# Access at http://localhost:4400
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up --build -d demo-site

# View logs
docker logs -f aaca-demo-site
```

## Troubleshooting

### Demo site not loading

1. **Check if container is running**:
   ```bash
   docker ps | grep aaca-demo-site
   ```

2. **Check logs**:
   ```bash
   docker logs aaca-demo-site
   ```

3. **Verify API is running**:
   ```bash
   curl http://localhost:8080/health
   ```

### Embed script not loading

1. **Check if /autofix.js is accessible**:
   ```bash
   curl http://localhost:4400/autofix.js
   ```

2. **Check browser console** for errors

3. **Verify embed-config endpoint** returns data:
   ```bash
   curl -H "X-Embed-Key: demo-embed-key-12345" \
     http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config
   ```

### Alt text not appearing

1. **Verify scan issues exist**:
   ```bash
   docker exec aaca-postgres psql -U aaca -d aaca -c \
     "SELECT COUNT(*) FROM scan_issues WHERE scan_id = '00000000-0000-0000-0000-000000000010'::uuid;"
   ```

2. **Check embed-config API** returns `altTextSuggestions` array

3. **Inspect elements** in browser DevTools to see if alt attributes are added

## Success Criteria Checklist

- [ ] Demo site accessible at http://localhost:4400
- [ ] Toggle button visible and functional
- [ ] Clicking toggle ON injects script tag
- [ ] Script loads from /autofix.js (verify in Network tab)
- [ ] Alt text appears on all 4 images when script enabled
- [ ] Focus outlines visible when tabbing through page
- [ ] Skip link appears at top when script enabled
- [ ] Clicking toggle OFF reloads page and removes fixes
- [ ] No console errors
- [ ] Embed-config API returns 4 alt text suggestions

## Links

- **Demo Site**: http://localhost:4400
- **API Health**: http://localhost:8080/health
- **Embed Config**: http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config

## License

Part of the AACA (AI Accessibility Compliance Assistant) project.
