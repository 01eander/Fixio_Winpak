
-- Add default_warehouse_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL;

-- Create user_tools table (Tools assigned to a mechanic)
CREATE TABLE IF NOT EXISTS user_tools (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    assigned_at TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, asset_id)
);
