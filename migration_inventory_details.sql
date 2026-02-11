-- Add manufacturer to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);

-- Add detailed location fields to item_warehouses
ALTER TABLE item_warehouses ADD COLUMN IF NOT EXISTS aisle VARCHAR(50);
ALTER TABLE item_warehouses ADD COLUMN IF NOT EXISTS shelf VARCHAR(50);
ALTER TABLE item_warehouses ADD COLUMN IF NOT EXISTS bin VARCHAR(50);
