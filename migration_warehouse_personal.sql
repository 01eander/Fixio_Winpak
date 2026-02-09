-- Add is_personal flag to warehouses table
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT FALSE;
