const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

async function splitAssets() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("🛠️  Separando Áreas y Equipos...");

        // 1. Crear tabla areas
        await client.query(`
            CREATE TABLE IF NOT EXISTS areas (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) UNIQUE NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 2. Crear tabla equipment
        await client.query(`
            CREATE TABLE IF NOT EXISTS equipment (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                model VARCHAR(100),
                serial_number VARCHAR(100),
                category_id INT REFERENCES asset_categories(id),
                area_id INT REFERENCES areas(id),
                parent_id INT REFERENCES equipment(id),
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 3. Migrar Áreas (desde assets where category = 'AREA')
        console.log("   - Migrando Áreas...");
        const areasRes = await client.query("SELECT id, name FROM assets WHERE category = 'AREA'");
        for (const area of areasRes.rows) {
            await client.query("INSERT INTO areas (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name", [area.id, area.name]);
        }
        await client.query("SELECT setval('areas_id_seq', (SELECT MAX(id) FROM areas))");

        // 4. Migrar Equipos (desde assets where category != 'AREA')
        console.log("   - Migrando Equipos...");
        const assetsRes = await client.query("SELECT * FROM assets WHERE category IS NULL OR category != 'AREA' ORDER BY id ASC");

        for (const asset of assetsRes.rows) {
            // Determinar si el padre es una Área o un Equipo
            let areaId = null;
            let parentId = null;

            if (asset.parent_id) {
                const parentRes = await client.query("SELECT category FROM assets WHERE id = $1", [asset.parent_id]);
                if (parentRes.rows.length > 0) {
                    if (parentRes.rows[0].category === 'AREA') {
                        areaId = asset.parent_id;
                    } else {
                        parentId = asset.parent_id;
                    }
                }
            }

            await client.query(`
                INSERT INTO equipment (id, name, model, serial_number, category_id, area_id, parent_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    model = EXCLUDED.model,
                    serial_number = EXCLUDED.serial_number,
                    category_id = EXCLUDED.category_id,
                    area_id = EXCLUDED.area_id,
                    parent_id = EXCLUDED.parent_id,
                    status = EXCLUDED.status
            `, [asset.id, asset.name, asset.model, asset.serial_number, asset.category_id, areaId, parentId, asset.status || 'ACTIVE']);
        }
        await client.query("SELECT setval('equipment_id_seq', (SELECT MAX(id) FROM equipment))");

        await client.query('COMMIT');
        console.log("✅ Tablas 'areas' y 'equipment' creadas y pobladas correctamente.");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ ERROR:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

splitAssets();
