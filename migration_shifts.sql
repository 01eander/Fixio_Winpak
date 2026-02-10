-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    daily_hours NUMERIC(4, 2) NOT NULL DEFAULT 8.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default shifts
INSERT INTO shifts (name, description, daily_hours) VALUES 
('Matutino', 'Turno de la mañana', 8.00),
('Vespertino', 'Turno de la tarde', 7.50),
('Nocturno', 'Turno de la noche', 7.00)
ON CONFLICT (name) DO NOTHING;
