const db = require('./db');

const query = `
CREATE TABLE IF NOT EXISTS conversion_logs (
    id SERIAL PRIMARY KEY,
    item VARCHAR(50),
    fecha_creacion DATE,
    fecha_termino DATE,
    status VARCHAR(50),
    area VARCHAR(255),
    maquina VARCHAR(255),
    seccion VARCHAR(255),
    hora_inicio TIME,
    hora_fin TIME,
    min_intervencion INTEGER,
    min_total_paro INTEGER,
    realizo_id UUID REFERENCES users(id),
    tipo_falla VARCHAR(255),
    tipo_accion VARCHAR(255),
    cantidad INTEGER,
    refaccion TEXT,
    falla TEXT,
    solucion TEXT,
    analisis_falla TEXT,
    opl VARCHAR(255),
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function createTable() {
    try {
        await db.query(query);
        console.log('Table conversion_logs created successfully.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        process.exit();
    }
}

createTable();
