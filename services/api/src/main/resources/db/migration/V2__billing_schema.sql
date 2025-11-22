-- Billing and payments schema for payments-admin portal

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    currency CHAR(3) NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    primary_contact_email VARCHAR(255),
    tax_id VARCHAR(255),
    tax_exempt BOOLEAN NOT NULL DEFAULT FALSE,
    billing_address JSONB,
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_currency ON accounts(currency);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);

CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INT,
    exp_year INT,
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    billing_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_payment_methods_account_id ON payment_methods(account_id);
CREATE INDEX idx_payment_methods_status ON payment_methods(status);

CREATE TABLE plans (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE prices (
    id UUID PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    interval VARCHAR(50) NOT NULL,
    interval_count INT NOT NULL DEFAULT 1,
    usage_type VARCHAR(50) NOT NULL DEFAULT 'LICENSED',
    trial_period_days INT,
    billing_scheme VARCHAR(50),
    stripe_price_id VARCHAR(255) UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_prices_plan_id ON prices(plan_id);
CREATE INDEX idx_prices_currency ON prices(currency);

CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    percent_off NUMERIC(5,2),
    amount_off BIGINT,
    duration VARCHAR(50) NOT NULL,
    duration_in_months INT,
    max_redemptions INT,
    redeem_by TIMESTAMPTZ,
    valid BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    currency CHAR(3) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    coupon_id UUID REFERENCES coupons(id),
    start_date TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    collection_method VARCHAR(50),
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);

CREATE TABLE subscription_items (
    id UUID PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    price_id UUID NOT NULL REFERENCES prices(id),
    quantity INT NOT NULL DEFAULT 1,
    stripe_subscription_item_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_subscription_items_subscription_id ON subscription_items(subscription_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    coupon_id UUID REFERENCES coupons(id),
    number VARCHAR(100) UNIQUE,
    status VARCHAR(50) NOT NULL,
    currency CHAR(3) NOT NULL,
    subtotal BIGINT,
    total BIGINT,
    amount_due BIGINT,
    amount_paid BIGINT,
    amount_remaining BIGINT,
    tax_amount BIGINT,
    fee_amount BIGINT,
    due_date TIMESTAMPTZ,
    issued_at TIMESTAMPTZ,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    collection_method VARCHAR(50),
    stripe_invoice_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_currency ON invoices(currency);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

CREATE TABLE invoice_lines (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    price_id UUID REFERENCES prices(id),
    description TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_amount BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    proration BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);

CREATE TABLE charges (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    status VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    stripe_charge_id VARCHAR(255) UNIQUE,
    failure_code VARCHAR(100),
    failure_message TEXT,
    authorized_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    refunded_amount BIGINT DEFAULT 0,
    fee_amount BIGINT,
    net_amount BIGINT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_charges_account_id ON charges(account_id);
CREATE INDEX idx_charges_status ON charges(status);
CREATE INDEX idx_charges_currency ON charges(currency);
CREATE INDEX idx_charges_created_at ON charges(created_at);

CREATE TABLE refunds (
    id UUID PRIMARY KEY,
    charge_id UUID NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    reason VARCHAR(100),
    stripe_refund_id VARCHAR(255) UNIQUE,
    refunded_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_refunds_charge_id ON refunds(charge_id);
CREATE INDEX idx_refunds_created_at ON refunds(created_at);

CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    charge_id UUID NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    reason VARCHAR(100),
    evidence_due_at TIMESTAMPTZ,
    evidence_submitted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    stripe_dispute_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_disputes_charge_id ON disputes(charge_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);

CREATE TABLE credit_notes (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    reason VARCHAR(100),
    stripe_credit_note_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_credit_notes_invoice_id ON credit_notes(invoice_id);

CREATE TABLE adjustments (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_adjustments_account_id ON adjustments(account_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    actor_user_id UUID REFERENCES users(id),
    actor_email VARCHAR(255),
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(150) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    request_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(150) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at);

CREATE TABLE dunning_schedules (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    strategy JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_dunning_schedules_account_id ON dunning_schedules(account_id);

CREATE TABLE dunning_events (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    schedule_id UUID REFERENCES dunning_schedules(id),
    step_name VARCHAR(150),
    channel VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    attempt_number INT,
    occurred_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_dunning_events_account_id ON dunning_events(account_id);
CREATE INDEX idx_dunning_events_invoice_id ON dunning_events(invoice_id);

CREATE TABLE reconciliation_drifts (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    stripe_id VARCHAR(255),
    drift_type VARCHAR(100),
    details JSONB,
    detected_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_reconciliation_drifts_resource ON reconciliation_drifts(resource_type, resource_id);

CREATE TABLE idempotency_requests (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) NOT NULL,
    request_hash VARCHAR(255),
    request_id VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE(account_id, idempotency_key)
);
CREATE INDEX idx_idempotency_requests_key ON idempotency_requests(idempotency_key);
