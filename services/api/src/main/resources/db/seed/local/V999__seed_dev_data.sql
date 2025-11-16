-- Dev-only seed data. Do not use in production.
INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'devuser@example.com',
    '$2a$10$DEVONLYPASSWORDHASH00000000000000000000000000000000000000',
    'Dev User',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO sites (id, user_id, name, base_url, is_active, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Example Bakery',
    'https://example.com',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO embed_keys (id, site_id, key_value, created_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'embed_dev_key_123',
    NOW()
) ON CONFLICT (id) DO NOTHING;
