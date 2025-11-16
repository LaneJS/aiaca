CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sites (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, base_url)
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_type VARCHAR(50) NOT NULL,
    key_value VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE TABLE embed_keys (
    id UUID PRIMARY KEY,
    site_id UUID NOT NULL UNIQUE REFERENCES sites(id) ON DELETE CASCADE,
    key_value VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE TABLE scans (
    id UUID PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    scan_type VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    accessibility_score DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_scans_site_id ON scans(site_id);
CREATE INDEX idx_scans_status ON scans(status);

CREATE TABLE scan_issues (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    issue_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    selector TEXT,
    html_context TEXT,
    description TEXT NOT NULL,
    page_url TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_scan_issues_scan_id ON scan_issues(scan_id);
CREATE INDEX idx_scan_issues_severity ON scan_issues(severity);

CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY,
    scan_issue_id UUID NOT NULL REFERENCES scan_issues(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    suggestion TEXT NOT NULL,
    rationale TEXT,
    applied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_ai_suggestions_issue_id ON ai_suggestions(scan_issue_id);
