-- Add shift_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL;

-- Optional: Set a default shift for existing users if any
-- UPDATE users SET shift_id = (SELECT id FROM shifts WHERE name = 'Matutino' LIMIT 1) WHERE shift_id IS NULL;
