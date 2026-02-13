import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

async function runSchema() {
    console.log("🛠️  EJECUTANDO ESQUEMA DE BASE DE DATOS...");
    const client = await pool.connect();
    try {
        const schemaPath = path.join(__dirname, '../init_schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Archivo no encontrado: ${schemaPath}`);
        }

        const sql = fs.readFileSync(schemaPath, 'utf-8');
        console.log(`📂 Leído SQL (${sql.length} bytes)`);

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log("✅ ESQUEMA CREADO CORRECTAMENTE.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ ERROR AL CREAR ESQUEMA:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

runSchema();
