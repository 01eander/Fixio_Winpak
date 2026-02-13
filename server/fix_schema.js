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

async function fixSchema() {
    console.log("🛠️  ALINEANDO ESQUEMA DE BASE DE DATOS (2)...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("   - Reparando tabla ASSETS...");
        // Permitir que category sea NULL (para usar category_id) y agregar FK
        await client.query(`
            ALTER TABLE assets 
            ALTER COLUMN category DROP NOT NULL,
            ADD COLUMN IF NOT EXISTS category_id INT REFERENCES asset_categories(id);
        `);

        console.log("   - Reparando tabla INVENTORY_ITEMS...");
        await client.query(`
            ALTER TABLE inventory_items 
            ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
        `);

        await client.query('COMMIT');
        console.log("✅ ESQUEMA DE ASSETS Y OTROS CORREGIDO.");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ ERROR AL ACTUALIZAR ESQUEMA:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

fixSchema();
