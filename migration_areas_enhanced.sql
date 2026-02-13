-- Add description and image_url to areas table
ALTER TABLE areas ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
