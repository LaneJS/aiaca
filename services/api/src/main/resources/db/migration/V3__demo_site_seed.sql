-- Demo Site Seed Data
-- Creates a demo site with pre-configured scan results for the embed script demo

-- Demo User (if not exists)
INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'demo@a11yassistant.com',
    '$2a$10$demohashedpasswordplaceholder000000000000000000000000000',
    'Demo User',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo Site
INSERT INTO sites (id, user_id, name, base_url, url, embed_key, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'AACA Demo Site',
    'http://localhost:4400',
    'http://localhost:4400',
    'demo-embed-key-12345',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo Scan (completed)
INSERT INTO scans (id, site_id, status, scan_type, started_at, completed_at, accessibility_score, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'COMPLETED',
    'SCHEDULED',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 minutes',
    65.5,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Scan Issues with Alt Text Suggestions
-- Note: The 'type' field is used by SiteService.toEmbedConfig() to filter alt text issues
-- The 'suggestion' field contains the AI-generated alt text

-- Issue 1: Hero image missing alt text
INSERT INTO scan_issues (id, scan_id, type, severity, status, selector, suggestion, description, page_url, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000100',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    'MEDIUM',
    'OPEN',
    'img.hero-image',
    'Modern office workspace with laptop displaying accessibility dashboard and colorful charts on screen',
    'Hero image is missing alternative text for screen readers',
    'http://localhost:4400/',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Issue 2: Feature automation image missing alt text
INSERT INTO scan_issues (id, scan_id, type, severity, status, selector, suggestion, description, page_url, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    'MEDIUM',
    'OPEN',
    '#feature-automation',
    'Automated scanning process showing AI analyzing web page elements for accessibility issues',
    'Feature image is missing alternative text for screen readers',
    'http://localhost:4400/',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Issue 3: Feature monitoring image missing alt text
INSERT INTO scan_issues (id, scan_id, type, severity, status, selector, suggestion, description, page_url, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    'MEDIUM',
    'OPEN',
    '#feature-monitoring',
    'Real-time monitoring dashboard displaying accessibility compliance scores and trend graphs',
    'Feature image is missing alternative text for screen readers',
    'http://localhost:4400/',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Issue 4: Site logo missing alt text
INSERT INTO scan_issues (id, scan_id, type, severity, status, selector, suggestion, description, page_url, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000010',
    'missing_alt_text',
    'MEDIUM',
    'OPEN',
    '.site-logo',
    'AACA logo - AI-powered accessibility compliance assistant',
    'Site logo is missing alternative text for screen readers',
    'http://localhost:4400/',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
