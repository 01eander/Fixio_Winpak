const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load .env file

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function importEquipmentEnhanced() {
    const csvPath = path.join(__dirname, '../data_templates/equipos_plantilla.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`ERROR: File not found at ${csvPath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });

    console.log(`🚀 Starting Multi-Level Import of ${records.length} records...`);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log("--> Phase 0: Cleaning Table...");
        // Truncate equipment table and reset sequences. Cascade to handle potential self-references if needed.
        await client.query('TRUNCATE TABLE equipment RESTART IDENTITY CASCADE');
        console.log("   ✓ Equipment table truncated.");

        // Hierarchy Columns definition
        const HIERARCHY_COLS = ['equipment_name', 'Componente', 'subcomponente', 'Nivel2', 'Nivel3', 'Nivel4'];

        // Phase 1: Ensure Areas and Categories exist
        const areaMap = new Map();
        const categoryMap = new Map();

        console.log("--> Phase 1: Checking Areas and Categories...");
        for (const record of records) {
            const { area_name, category_name } = record;

            // Area
            if (area_name && !areaMap.has(area_name)) {
                let res = await client.query("SELECT id FROM areas WHERE name = $1", [area_name]);
                if (res.rowCount === 0) {
                    res = await client.query("INSERT INTO areas (name) VALUES ($1) RETURNING id", [area_name]);
                    console.log(`   + Created Area: ${area_name}`);
                }
                areaMap.set(area_name, res.rows[0].id);
            }

            // Category
            if (category_name && !categoryMap.has(category_name)) {
                let res = await client.query("SELECT id FROM asset_categories WHERE name = $1", [category_name]);
                if (res.rowCount === 0) {
                    res = await client.query("INSERT INTO asset_categories (name) VALUES ($1) RETURNING id", [category_name]);
                    console.log(`   + Created Category: ${category_name}`);
                }
                categoryMap.set(category_name, res.rows[0].id);
            }
        }

        // Phase 2: Process Hierarchy Row by Row
        console.log("--> Phase 2: Processing Equipment Structure...");

        let processedCount = 0;

        for (const record of records) {
            const areaId = areaMap.get(record.area_name);
            if (!areaId) {
                console.warn(`   ⚠️ Warning: Area '${record.area_name}' not found/created. Skipping row.`);
                continue;
            }

            // Determine depth (last non-empty hierarchy column)
            let targetIndex = -1;
            for (let i = HIERARCHY_COLS.length - 1; i >= 0; i--) {
                if (record[HIERARCHY_COLS[i]]) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) continue; // Skip empty rows

            let currentParentId = null;

            // Iterate from Root to Target
            for (let i = 0; i <= targetIndex; i++) {
                const colName = HIERARCHY_COLS[i];
                const itemName = record[colName];
                const isTarget = (i === targetIndex);

                // Properties for the Target Item (from CSV row)
                // For intermediate items, we default irrelevant fields
                const model = isTarget ? record.model : null;
                const serial = isTarget ? record.serial_number : null;
                const status = isTarget ? (record.status || 'ACTIVE') : 'ACTIVE';
                const categoryId = isTarget ? (categoryMap.get(record.category_name) || null) : null;

                // Search Logic
                let existingRes;
                if (i === 0) {
                    // Root Item: Look in Area, with NO Parent
                    existingRes = await client.query(
                        "SELECT id FROM equipment WHERE name = $1 AND area_id = $2 AND parent_id IS NULL",
                        [itemName, areaId]
                    );
                } else {
                    // Child Item: Look under Current Parent
                    existingRes = await client.query(
                        "SELECT id FROM equipment WHERE name = $1 AND parent_id = $2",
                        [itemName, currentParentId]
                    );
                }

                if (existingRes.rowCount > 0) {
                    // Found: Update if it is the target (to sync details like serial/model)
                    const id = existingRes.rows[0].id;
                    currentParentId = id; // Set as parent for next level

                    if (isTarget) {
                        await client.query(
                            "UPDATE equipment SET model = $2, serial_number = $3, category_id = $4, status = $5, updated_at = NOW() WHERE id = $1",
                            [id, model, serial, categoryId, status]
                        );
                        // console.log(`   . Updated ${itemName}`);
                    }
                } else {
                    // Not Found: Insert
                    const insertAreaId = (i === 0) ? areaId : null;
                    const insertParentId = (i === 0) ? null : currentParentId;

                    const insertRes = await client.query(
                        "INSERT INTO equipment (name, area_id, parent_id, model, serial_number, category_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                        [itemName, insertAreaId, insertParentId, model, serial, categoryId, status]
                    );

                    currentParentId = insertRes.rows[0].id; // Set as parent for next level
                    // console.log(`   + Created ${itemName} (Level ${i})`);
                }
            }
            processedCount++;
            if (processedCount % 50 === 0) process.stdout.write('.');
        }

        console.log(`\nProcessed ${processedCount} rows.`);

        await client.query('COMMIT');
        console.log("✅ Import Completed Successfully!");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Error importing data:", err);
    } finally {
        client.release();
        pool.end();
    }
}

importEquipmentEnhanced();
