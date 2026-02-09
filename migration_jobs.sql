-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'General', -- e.g., Preventivo, Correctivo
    estimated_time NUMERIC(5, 2) DEFAULT 0, -- Hours
    base_cost NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert some default values
INSERT INTO maintenance_tasks (name, type, estimated_time, base_cost) VALUES 
('Lubricación General', 'Preventivo', 0.5, 0),
('Cambio de Aceite', 'Preventivo', 1.0, 50),
('Reparación Eléctrica', 'Correctivo', 2.0, 0),
('Inspección Mensual', 'Preventivo', 4.0, 0)
ON CONFLICT DO NOTHING;
