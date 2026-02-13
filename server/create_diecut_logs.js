const db = require('./db');

const query = `
CREATE TABLE IF NOT EXISTS diecut_logs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    fecha DATE NOT NULL,
    hora_inicio TIME,
    diametro VARCHAR(50),
    troquel VARCHAR(50),
    embosser VARCHAR(50),
    tipo_falla VARCHAR(255),
    causa VARCHAR(255),
    tiempo_intervencion INTEGER,
    tiempo_paro INTEGER,
    comentarios TEXT,
    ajustador_id UUID REFERENCES users(id),
    operador_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function createTable() {
    try {
        await db.query(query);
        console.log('Table diecut_logs created successfully.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        process.exit();
    }
}

createTable();
