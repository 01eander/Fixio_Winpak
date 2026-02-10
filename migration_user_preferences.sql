-- Add preferences column to user_settings for granular notification settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
