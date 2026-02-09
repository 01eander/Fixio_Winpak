
-- Table to link maintenance tasks (jobs) with required tools (assets or inventory items)
-- Assuming 'tools' refers to Assets of category 'Herramienta' OR Inventory items of category 'Herramienta'?
-- The user says "trabajos-herramientas por trabajo".
-- Usually maintenance tasks require Tools (Assets) or Consumables (Inventory).
-- Let's assume Assets for now as "Herramientas" (Tools) are usually Assets.
-- But user might mean Inventory items if they are consumable tools.
-- Given previous context, Assets has 'Herramienta' category.
-- Let's link maintenance_tasks to assets (where category is likely 'Herramienta').
-- OR create a generic link to assets?

CREATE TABLE IF NOT EXISTS job_tools (
    id SERIAL PRIMARY KEY,
    maintenance_task_id INTEGER REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1, -- Usually 1 for assets, but maybe more?
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(maintenance_task_id, asset_id)
);

-- Note: If tools are from Inventory (consumables like drill bits), we might need another table job_materials.
-- But request says "Tools". Using Assets table connection.
