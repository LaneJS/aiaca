-- Local-only RBAC seed for payments-admin (do NOT commit to VCS).
-- Logins and roles (change emails/passwords before running if desired):
--   ADMIN    -> admin@local.test    / admin123!
--   OPERATOR -> operator@local.test / operator123!
--   VIEWER   -> viewer@local.test   / viewer123!
-- Safe to re-run; inserts only if missing. Postgres-only (relies on pgcrypto).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    admin_email CONSTANT text := 'admin@local.test';
    admin_password CONSTANT text := 'admin123!';
    operator_email CONSTANT text := 'operator@local.test';
    operator_password CONSTANT text := 'operator123!';
    viewer_email CONSTANT text := 'viewer@local.test';
    viewer_password CONSTANT text := 'viewer123!';

    admin_role_id uuid;
    operator_role_id uuid;
    viewer_role_id uuid;

    admin_user_id uuid;
    operator_user_id uuid;
    viewer_user_id uuid;
BEGIN
    -- Ensure base roles exist
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
    IF admin_role_id IS NULL THEN
        INSERT INTO roles (id, name, description, created_at, updated_at)
        VALUES (gen_random_uuid(), 'ADMIN', 'Local admin role (seed)', now(), now())
        RETURNING id INTO admin_role_id;
    END IF;

    SELECT id INTO operator_role_id FROM roles WHERE name = 'OPERATOR';
    IF operator_role_id IS NULL THEN
        INSERT INTO roles (id, name, description, created_at, updated_at)
        VALUES (gen_random_uuid(), 'OPERATOR', 'Local operator role (seed)', now(), now())
        RETURNING id INTO operator_role_id;
    END IF;

    SELECT id INTO viewer_role_id FROM roles WHERE name = 'VIEWER';
    IF viewer_role_id IS NULL THEN
        INSERT INTO roles (id, name, description, created_at, updated_at)
        VALUES (gen_random_uuid(), 'VIEWER', 'Local viewer role (seed)', now(), now())
        RETURNING id INTO viewer_role_id;
    END IF;

    -- Ensure users exist (no overrides if they already exist)
    SELECT id INTO admin_user_id FROM users WHERE email = admin_email;
    IF admin_user_id IS NULL THEN
        INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES (gen_random_uuid(), admin_email, crypt(admin_password, gen_salt('bf')), 'Local Admin', now(), now())
        RETURNING id INTO admin_user_id;
    END IF;

    SELECT id INTO operator_user_id FROM users WHERE email = operator_email;
    IF operator_user_id IS NULL THEN
        INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES (gen_random_uuid(), operator_email, crypt(operator_password, gen_salt('bf')), 'Local Operator', now(), now())
        RETURNING id INTO operator_user_id;
    END IF;

    SELECT id INTO viewer_user_id FROM users WHERE email = viewer_email;
    IF viewer_user_id IS NULL THEN
        INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES (gen_random_uuid(), viewer_email, crypt(viewer_password, gen_salt('bf')), 'Local Viewer', now(), now())
        RETURNING id INTO viewer_user_id;
    END IF;

    -- Link users to roles (idempotent)
    IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (admin_user_id, admin_role_id, now())
        ON CONFLICT DO NOTHING;
    END IF;

    IF operator_user_id IS NOT NULL AND operator_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (operator_user_id, operator_role_id, now())
        ON CONFLICT DO NOTHING;
    END IF;

    IF viewer_user_id IS NOT NULL AND viewer_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (viewer_user_id, viewer_role_id, now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

