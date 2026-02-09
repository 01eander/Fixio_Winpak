
-- Table to link items and warehouses with stock quantity
CREATE TABLE IF NOT EXISTS item_warehouses (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    min_stock_limit INTEGER DEFAULT 0,
    max_stock_limit INTEGER,
    location_in_warehouse VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(inventory_item_id, warehouse_id)
);

-- Insert statement to migrate existing stock?
-- (Assuming existing inventory_items.quantity might need to be moved to a default warehouse if we wanted to be strict, but for now we start fresh or rely on user to assign)
