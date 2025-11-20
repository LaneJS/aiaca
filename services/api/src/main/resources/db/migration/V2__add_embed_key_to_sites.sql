-- Add embed_key column to sites table for direct storage
ALTER TABLE sites ADD COLUMN IF NOT EXISTS embed_key VARCHAR(255);

-- Add url column as alias/rename for base_url (for model compatibility)
ALTER TABLE sites ADD COLUMN IF NOT EXISTS url TEXT;

-- Copy base_url to url for existing records
UPDATE sites SET url = base_url WHERE url IS NULL;

-- Create unique index on embed_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_embed_key ON sites(embed_key);
