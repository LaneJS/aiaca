# TODO 19: Embed Script Demo Site

**Mission:** Create a standalone demo website that showcases the AACA embed script (autofix.js) in action with a toggle to see before/after accessibility fixes.

**Priority:** HIGH - Critical for sales demos and customer onboarding

**Agent:** Frontend Web App Agent + Database Setup

**Target Audience:** Prospects, customers, and internal team members who want to see the embed script working live

---

## 1. Project Overview

Create a new Angular application in the monorepo at `apps/demo-site` that:

1. **Displays a basic website** with intentional accessibility issues (missing alt text, poor focus indicators, no skip link)
2. **Includes the embed script** configured to fetch fixes from the backend API
3. **Provides a toggle control** to enable/disable the script dynamically to demonstrate before/after
4. **Uses real backend integration** with a pre-configured demo site and scan in the database
5. **Runs in Docker Compose** alongside existing services (marketing, dashboard, api)

---

## 2. Technical Architecture

### 2.1 Angular Application Structure

**Location:** `apps/demo-site/`

**Technology Stack:**
- Angular 20.3.x (standalone components, signals)
- TypeScript 5.x
- SCSS for styling
- Nginx for serving (production)

**Project Structure:**
```
apps/demo-site/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # Root component with toggle control
│   │   ├── app.component.html        # Layout with demo content
│   │   ├── app.component.scss        # Styling
│   │   ├── app.routes.ts             # Route config (single page)
│   │   └── components/
│   │       ├── demo-header.component.ts
│   │       ├── demo-content.component.ts
│   │       └── script-toggle.component.ts
│   ├── environments/
│   │   ├── environment.ts            # Dev config
│   │   └── environment.prod.ts       # Prod config
│   ├── index.html                    # Entry point with embed script
│   ├── main.ts                       # Bootstrap
│   └── styles.scss                   # Global styles
├── public/
│   └── images/                       # Demo images (without alt text)
│       ├── hero.jpg
│       ├── feature-1.jpg
│       ├── feature-2.jpg
│       └── logo.png
├── project.json                      # Nx project config
├── tsconfig.app.json
├── tsconfig.spec.json
├── jest.config.ts
├── nginx.conf                        # Nginx config for Docker
└── Dockerfile                        # Multi-stage build
```

### 2.2 Demo Site Configuration

**Site Details (to be created in database):**
- **Site Name:** "AACA Demo Site"
- **URL:** `http://localhost:4400` (development) / `https://demo.a11yassistant.com` (production)
- **Site ID:** Fixed UUID (e.g., `00000000-0000-0000-0000-000000000001`)
- **Embed Key:** Fixed key (e.g., `demo-embed-key-12345`)

**Associated Scan:**
- **Status:** `COMPLETED`
- **Issues:** Pre-populated with alt text suggestions for demo images
- **Suggestions:** AI-generated alt text for hero.jpg, feature-1.jpg, feature-2.jpg, logo.png

---

## 3. Implementation Requirements

### 3.1 HTML Content with Accessibility Issues

Create a simple one-page website with these intentional issues:

**Missing Alt Text (4 images):**
```html
<img src="/images/hero.jpg" class="hero-image">
<img src="/images/feature-1.jpg" id="feature-automation">
<img src="/images/feature-2.jpg" id="feature-monitoring">
<img src="/images/logo.png" class="site-logo">
```

**Poor Focus Indicators:**
- Links and buttons with no visible :focus styles
- Default browser outline removed via CSS

**No Skip Link:**
- No skip navigation link for keyboard users

**Example Content Structure:**
```html
<div class="demo-site">
  <!-- Control Panel (always visible) -->
  <div class="control-panel">
    <h2>AACA Embed Script Demo</h2>
    <p>Toggle the script on/off to see accessibility fixes in action</p>
    <app-script-toggle></app-script-toggle>
  </div>

  <!-- Demo Website Content -->
  <header class="demo-header">
    <img src="/images/logo.png" class="site-logo">
    <nav>
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="main-content">
    <section class="hero">
      <img src="/images/hero.jpg" class="hero-image">
      <h1>Welcome to Our Product</h1>
      <button class="cta-button">Get Started</button>
    </section>

    <section class="features" id="features">
      <h2>Key Features</h2>
      <div class="feature-grid">
        <div class="feature">
          <img src="/images/feature-1.jpg" id="feature-automation">
          <h3>Automated Scanning</h3>
          <p>AI-powered accessibility detection</p>
        </div>
        <div class="feature">
          <img src="/images/feature-2.jpg" id="feature-monitoring">
          <h3>Real-time Monitoring</h3>
          <p>Continuous compliance tracking</p>
        </div>
      </div>
    </section>
  </main>
</div>
```

### 3.2 Script Toggle Component

**File:** `apps/demo-site/src/app/components/script-toggle.component.ts`

**Functionality:**
- Toggle button to enable/disable the embed script
- Visual indicator showing current state (ON/OFF)
- Dynamically inject/remove the script tag from the DOM
- Persist state in localStorage (optional)

**Implementation Approach:**

```typescript
@Component({
  selector: 'app-script-toggle',
  standalone: true,
  template: `
    <div class="toggle-control">
      <label>
        <input
          type="checkbox"
          [checked]="scriptEnabled()"
          (change)="toggle()"
        />
        <span class="toggle-label">
          Embed Script: {{ scriptEnabled() ? 'ON' : 'OFF' }}
        </span>
      </label>

      <div class="status-indicator" [class.active]="scriptEnabled()">
        {{ scriptEnabled() ? '✓ Fixes Active' : '✗ No Fixes' }}
      </div>
    </div>
  `
})
export class ScriptToggleComponent {
  scriptEnabled = signal(false);

  toggle(): void {
    const newState = !this.scriptEnabled();
    this.scriptEnabled.set(newState);

    if (newState) {
      this.injectScript();
    } else {
      this.removeScript();
    }
  }

  private injectScript(): void {
    const script = document.createElement('script');
    script.id = 'aaca-embed-script';
    script.src = '/autofix.js'; // Served via nginx
    script.setAttribute('data-site-id', '00000000-0000-0000-0000-000000000001');
    script.setAttribute('data-embed-key', 'demo-embed-key-12345');
    document.head.appendChild(script);
  }

  private removeScript(): void {
    const script = document.getElementById('aaca-embed-script');
    if (script) {
      script.remove();
      // Reload page to reset fixes
      window.location.reload();
    }
  }
}
```

### 3.3 Nginx Configuration

**File:** `apps/demo-site/nginx.conf`

**Requirements:**
- Serve built Angular app as SPA
- Proxy API requests to backend
- **Serve autofix.js from /autofix.js path** (critical for demo)
- Enable CORS for embed script

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    # Serve the embed script
    location /autofix.js {
        alias /usr/share/nginx/html/autofix.js;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=3600";
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Angular SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3.4 Dockerfile

**File:** `apps/demo-site/Dockerfile`

**Pattern:** Follow existing dashboard/marketing-site pattern

```dockerfile
# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /workspace
COPY package*.json nx.json tsconfig.base.json .
COPY apps ./apps
COPY services ./services
COPY packages ./packages
RUN CYPRESS_INSTALL_BINARY=0 npm ci
RUN npx nx build demo-site --configuration=production

FROM nginx:1.27-alpine
COPY apps/demo-site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/apps/demo-site/browser /usr/share/nginx/html

# CRITICAL: Copy the embed script to be served at /autofix.js
COPY --from=builder /workspace/packages/embed-script/dist/autofix.js /usr/share/nginx/html/autofix.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.5 Nx Project Configuration

**File:** `apps/demo-site/project.json`

```json
{
  "name": "demo-site",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/demo-site/src",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/demo-site",
        "browser": "apps/demo-site/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/demo-site/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/demo-site/public"
          }
        ],
        "styles": ["apps/demo-site/src/styles.scss"]
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@angular/build:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "demo-site:build:production"
        },
        "development": {
          "buildTarget": "demo-site:build:development"
        }
      },
      "defaultConfiguration": "development",
      "options": {
        "port": 4400
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/demo-site/jest.config.ts",
        "tsConfig": "apps/demo-site/tsconfig.spec.json"
      }
    }
  }
}
```

### 3.6 Docker Compose Integration

**File:** `docker-compose.yml` (add new service)

```yaml
  demo-site:
    build:
      context: .
      dockerfile: apps/demo-site/Dockerfile
    container_name: aaca-demo-site
    depends_on:
      - api
    env_file:
      - .env
    environment:
      API_BASE_URL: ${PUBLIC_API_BASE_URL:-http://localhost:8080}
    ports:
      - "${DEMO_SITE_PORT:-4400}:80"
```

**Environment Variable:**
Add to `.env` file:
```
DEMO_SITE_PORT=4400
```

---

## 4. Database Seed Data

### 4.1 SQL Seed Script

**File:** `services/api/src/main/resources/db/seed/demo-site-data.sql`

**Purpose:** Create demo site, scan, and issues with alt text suggestions

```sql
-- Demo User (if not exists)
INSERT INTO users (id, email, password, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@a11yassistant.com',
  '$2a$10$demohashedpassword', -- Hashed: 'demo123'
  'Demo User',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo Site
INSERT INTO sites (id, owner_id, name, url, embed_key, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'AACA Demo Site',
  'http://localhost:4400',
  'demo-embed-key-12345',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo Scan
INSERT INTO scans (id, site_id, status, started_at, completed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'COMPLETED',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Scan Issues with Alt Text Suggestions
INSERT INTO scan_issues (id, scan_id, type, selector, suggestion, status, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000100',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    'img.hero-image',
    'Modern office workspace with laptop displaying accessibility dashboard and colorful charts on screen',
    'open',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    '#feature-automation',
    'Automated scanning process showing AI analyzing web page elements for accessibility issues',
    'open',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    '#feature-monitoring',
    'Real-time monitoring dashboard displaying accessibility compliance scores and trend graphs',
    'open',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    '.site-logo',
    'AACA logo - AI-powered accessibility compliance assistant',
    'open',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
```

### 4.2 Application Properties Configuration

**File:** `services/api/src/main/resources/application.properties`

Ensure the seed script runs on startup (if using Flyway or similar):

```properties
# If using Spring Boot's data.sql
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:db/seed/demo-site-data.sql
```

OR if using Flyway:
- Place script in `src/main/resources/db/migration/V999__demo_site_seed.sql`
- Flyway will run it automatically

---

## 5. Demo Images

### 5.1 Image Requirements

Provide 4 placeholder images in `apps/demo-site/public/images/`:

1. **hero.jpg** (1200x600px) - Hero banner image
2. **feature-1.jpg** (400x300px) - Feature illustration
3. **feature-2.jpg** (400x300px) - Feature illustration
4. **logo.png** (200x60px) - Company logo

**Option 1:** Use placeholder service URLs:
```html
<img src="https://via.placeholder.com/1200x600/4A90E2/FFFFFF?text=Hero+Image" class="hero-image">
```

**Option 2:** Generate simple colored rectangles with text using Canvas/SVG
**Option 3:** Use copyright-free images from Unsplash/Pexels

### 5.2 Image Attribution

If using stock photos, include attribution in `apps/demo-site/public/ATTRIBUTION.md`

---

## 6. Styling Requirements

### 6.1 Intentional Accessibility Issues in CSS

**File:** `apps/demo-site/src/styles.scss`

```scss
// INTENTIONAL: Remove default focus outlines (to demonstrate fix)
*:focus {
  outline: none !important;
}

// Basic styling for demo content
.demo-site {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.control-panel {
  position: sticky;
  top: 0;
  background: #f0f4f8;
  padding: 1rem;
  border-bottom: 2px solid #cbd5e0;
  z-index: 1000;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.cta-button {
  background: #4A90E2;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.feature img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
```

### 6.2 Toggle Control Styling

```scss
.toggle-control {
  display: flex;
  align-items: center;
  gap: 1rem;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }

  .toggle-label {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .status-indicator {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background: #e53e3e;
    color: white;
    font-weight: 500;

    &.active {
      background: #48bb78;
    }
  }
}
```

---

## 7. Testing & Validation

### 7.1 Functionality Checklist

**Before Script Enabled:**
- [ ] Images have no alt attributes (inspect DevTools)
- [ ] No visible focus indicators when tabbing through links/buttons
- [ ] No skip link at top of page
- [ ] Toggle shows "OFF" state

**After Script Enabled:**
- [ ] Images have alt text populated (verify in DevTools)
- [ ] Focus indicators visible when tabbing (blue outline)
- [ ] Skip link appears at top of page
- [ ] Toggle shows "ON" state
- [ ] Console log shows embed script initialization

### 7.2 API Integration Test

Verify embed config endpoint returns correct data:

```bash
curl -X GET "http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config" \
  -H "X-Embed-Key: demo-embed-key-12345"
```

Expected response:
```json
{
  "siteId": "00000000-0000-0000-0000-000000000001",
  "embedKey": "demo-embed-key-12345",
  "autoFixes": ["alt_text", "focus_outline"],
  "enableSkipLink": true,
  "altTextSuggestions": [
    {
      "selector": "img.hero-image",
      "imageUrl": null,
      "altText": "Modern office workspace with laptop displaying accessibility dashboard..."
    },
    // ... 3 more suggestions
  ],
  "focusOutlineColor": "#1f6feb",
  "skipLinkText": "Skip to main content"
}
```

### 7.3 Docker Build Test

```bash
# Build and start demo site
docker-compose up --build -d demo-site

# Verify running
docker ps | grep aaca-demo-site

# Check logs
docker logs aaca-demo-site

# Test accessibility
curl http://localhost:4400
```

### 7.4 Browser Testing

1. Open http://localhost:4400
2. Inspect page source - verify no alt attributes initially
3. Toggle script ON
4. Verify script loads in Network tab
5. Inspect images - verify alt text added
6. Tab through page - verify focus outlines visible
7. Toggle script OFF
8. Verify page reloads and fixes removed

---

## 8. Implementation Steps

### Phase 1: Project Scaffolding (Agent Task)
1. Create directory structure: `apps/demo-site/`
2. Create Nx project configuration: `project.json`
3. Create TypeScript configs: `tsconfig.app.json`, `tsconfig.spec.json`
4. Create Jest config: `jest.config.ts`
5. Create Angular bootstrap files: `main.ts`, `app.component.ts`
6. Create environment files with demo site ID and embed key

### Phase 2: Demo Content (Agent Task)
1. Create demo HTML structure in `app.component.html`
2. Add placeholder images to `public/images/`
3. Create intentional accessibility issues in CSS
4. Create header and footer components
5. Implement responsive layout

### Phase 3: Toggle Component (Agent Task)
1. Create `script-toggle.component.ts`
2. Implement inject/remove script logic
3. Add visual indicators for ON/OFF state
4. Test dynamic script loading

### Phase 4: Docker Integration (Agent Task)
1. Create `Dockerfile` following existing pattern
2. Create `nginx.conf` with /autofix.js serving
3. Add demo-site service to `docker-compose.yml`
4. Add DEMO_SITE_PORT to `.env`
5. Test Docker build and run

### Phase 5: Database Setup (Agent Task)
1. Create SQL seed script: `demo-site-data.sql`
2. Configure Spring Boot to run seed on startup
3. Verify demo user, site, scan, and issues created
4. Test embed-config API endpoint returns correct data

### Phase 6: Testing & Validation (Agent Task)
1. Build and run via Docker Compose
2. Access http://localhost:4400
3. Test toggle functionality
4. Verify alt text appears when script enabled
5. Verify focus outlines visible
6. Verify skip link appears
7. Test toggle OFF removes fixes

### Phase 7: Documentation (Agent Task)
1. Add README.md to `apps/demo-site/`
2. Document how to access demo site
3. Document toggle usage
4. Add troubleshooting section

---

## 9. Success Criteria

### Must Have:
- ✅ Demo site builds and runs via Docker Compose
- ✅ Toggle control enables/disables embed script
- ✅ Alt text suggestions applied from backend API
- ✅ Focus outlines visible when script enabled
- ✅ Skip link appears when script enabled
- ✅ Site ID and embed key match database seed data
- ✅ No console errors when script loads

### Nice to Have:
- Visual comparison panel (side-by-side before/after)
- Accessibility score calculation
- List of detected issues with fix status
- Animation/highlight when fixes applied

---

## 10. Files to Create

**New Files:**
```
apps/demo-site/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.routes.ts
│   │   └── components/
│   │       ├── script-toggle.component.ts
│   │       ├── demo-header.component.ts
│   │       └── demo-content.component.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/
│   ├── images/
│   │   ├── hero.jpg
│   │   ├── feature-1.jpg
│   │   ├── feature-2.jpg
│   │   └── logo.png
│   └── ATTRIBUTION.md
├── project.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── jest.config.ts
├── nginx.conf
├── Dockerfile
└── README.md
```

**Files to Modify:**
```
docker-compose.yml                                    # Add demo-site service
.env                                                  # Add DEMO_SITE_PORT=4400
services/api/src/main/resources/db/seed/              # Add demo-site-data.sql
```

---

## 11. Environment Configuration

### Development
```typescript
// apps/demo-site/src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  demoSiteId: '00000000-0000-0000-0000-000000000001',
  demoEmbedKey: 'demo-embed-key-12345',
  embedScriptUrl: '/autofix.js'
};
```

### Production
```typescript
// apps/demo-site/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  demoSiteId: '00000000-0000-0000-0000-000000000001',
  demoEmbedKey: 'demo-embed-key-12345',
  embedScriptUrl: 'https://cdn.a11yassistant.com/autofix.js'
};
```

---

## 12. Validation Commands

**Build demo site:**
```bash
npx nx build demo-site --configuration=production
```

**Lint:**
```bash
npx nx lint demo-site
```

**Test:**
```bash
npx nx test demo-site
```

**Docker build and run:**
```bash
docker-compose up --build -d demo-site
```

**Verify database seed:**
```bash
docker exec -it aaca-postgres psql -U aaca -d aaca -c "SELECT * FROM sites WHERE id = '00000000-0000-0000-0000-000000000001';"
```

**Test embed config API:**
```bash
curl -X GET "http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config" \
  -H "X-Embed-Key: demo-embed-key-12345" | jq
```

---

## 13. Important Notes

### Script Loading Strategy
The toggle component dynamically injects/removes the script tag rather than using a static include. This allows users to see the exact before/after difference.

### Database Consistency
Use fixed UUIDs for demo data to ensure consistency across environments. The seed script uses `ON CONFLICT DO NOTHING` to be idempotent.

### CORS Configuration
The embed script requires CORS headers to be served from nginx. Ensure `Access-Control-Allow-Origin: *` is set on `/autofix.js` endpoint.

### Performance
The embed script should load and apply fixes within 500ms on a local network. Monitor Network tab for timing.

### Browser Compatibility
Test in Chrome, Firefox, Safari, and Edge to ensure cross-browser compatibility of dynamic script injection.

---

## 14. Next Steps After Implementation

1. Add to AGENTS.md as Section 19
2. Create demo video/GIF showing toggle in action
3. Share demo URL with sales team
4. Gather feedback on additional features to showcase
5. Consider adding analytics to track demo site usage

---

## 15. Agent Execution Notes

**Work in Docker:** All services run in Docker - use `docker-compose` commands for build/test/run.

**Follow Existing Patterns:** Match structure and configuration of `apps/dashboard` and `apps/marketing-site`.

**Test End-to-End:** Verify the entire flow from database seed → API endpoint → embed script → DOM manipulation.

**No Mock Data:** This is a real integration - use actual backend API calls with real database records.

**CRITICAL:** The `/autofix.js` path MUST be served by nginx for the script to load correctly. Don't forget to copy the embed script file in the Dockerfile.

---

**Status:** Ready for agent implementation
**Estimated Effort:** 4-6 hours (full implementation + testing)
**Dependencies:**
- Embed script built (`packages/embed-script/dist/autofix.js`)
- Backend API running with embed-config endpoint
- PostgreSQL database available
