const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');

const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

async function importWarehouses() {
    const csvPath = path.join(__dirname, '../data_templates/4_almacenes.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clear existing warehouses to avoid duplicates during this import
        await client.query('DELETE FROM warehouses');

        console.log(`Importing ${records.length} warehouses...`);

        for (const record of records) {
            const { name, area_name, is_personal } = record;

            // Find area_id by name in assets table (where category is AREA)
            const areaRes = await client.query(
                "SELECT id FROM assets WHERE name = $1 AND category = 'AREA'",
                [area_name]
            );

            let areaId = null;
            if (areaRes.rows.length > 0) {
                areaId = areaRes.rows[0].id;
                console.log(`Mapping '${area_name}' to ID: ${areaId}`);
            } else {
                console.warn(`Warning: Area '${area_name}' not found in assets. Inserting with area_id = null.`);
            }

            await client.query(
                "INSERT INTO warehouses (name, area_id, is_personal) VALUES ($1, $2, $3)",
                [name, areaId, is_personal.toUpperCase() === 'TRUE']
            );
        }

        await client.query('COMMIT');
        console.log("✅ Warehouses imported successfully.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Error importing warehouses:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

importWarehouses();
