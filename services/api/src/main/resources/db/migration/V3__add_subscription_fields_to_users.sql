-- Add subscription-related fields to users table

ALTER TABLE users
ADD COLUMN subscription_status VARCHAR(50) NOT NULL DEFAULT 'NONE',
ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE,
ADD COLUMN account_id UUID;

-- Add foreign key constraint to accounts table
ALTER TABLE users
ADD CONSTRAINT fk_users_account_id
FOREIGN KEY (account_id) REFERENCES accounts(id);

-- Add index for better query performance
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_account_id ON users(account_id);
