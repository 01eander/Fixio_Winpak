-- Create new catalog tables
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Fix Inventory 500 error by ensuring this table exists
CREATE TABLE IF NOT EXISTS inventory_stock (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add Foreign Keys (nullable for now to align with existing data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES user_roles(id);

ALTER TABLE assets ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES asset_categories(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS area_id INTEGER REFERENCES assets(id); -- Relates to 'AREA' assets specifically if needed, but assets.parent_id acts as this. User said "Ubicacion cambialo por areas".

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES inventory_categories(id);

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS area_id INTEGER REFERENCES assets(id); -- Links to an 'AREA' asset
-- Rename location to location_text or drop it? User said "cambialo por areas". I'll keep location as legacy for a moment or drop it? 
-- The user said "Conectalos al catalogo de areas". So area_id is the key.

-- Insert some default values to populate dropdowns
INSERT INTO departments (name) VALUES ('Mantenimiento'), ('Producción'), ('Logística') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (name) VALUES ('Administrador'), ('Técnico'), ('Operador') ON CONFLICT DO NOTHING;
INSERT INTO asset_categories (name) VALUES ('Maquinaria'), ('Vehículo'), ('Herramienta'), ('Área') ON CONFLICT DO NOTHING;
INSERT INTO inventory_categories (name) VALUES ('Refacción'), ('Consumible'), ('Herramienta') ON CONFLICT DO NOTHING;
