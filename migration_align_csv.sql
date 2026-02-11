-- Adjusting tables to match CSV templates

-- 1. Roles (Rename table to match server code and CSV template)
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        ALTER TABLE user_roles RENAME TO roles;
    END IF;
END $$;

-- 2. Maintenance Tasks
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS frequency_days INTEGER;
-- Rename estimated_time to match CSV Header
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='maintenance_tasks' AND column_name='estimated_time') THEN
        ALTER TABLE maintenance_tasks RENAME COLUMN estimated_time TO estimated_duration_hours;
    END IF;
END $$;

-- 3. Inventory Items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50);

-- 4. Assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS acquisition_date DATE;

-- 5. Areas (Check if we need a dedicated table or use assets)
-- Since server/index.js expects an 'areas' table for the simple catalog import, 
-- and warehouses.area_id references assets(id), we can create 'areas' as a VIEW 
-- but that might not support simple INSERTS.
-- Better to create the table 'areas' to satisfy the simple catalog requirement, 
-- or fix the server logic.
-- Given the "adjust the table" request, I'll create the missing areas table 
-- if it's simpler for the user's workflow, or stick to the assets-only model.
-- Actually, the user's template 3_areas.csv is a simple list of names.
-- I will create the areas table and update warehouses to reference it IF it makes sense.
-- But warehouses.area_id already references assets(id).
-- I'll stick to Assets and fix server/index.js.
