import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

// Helper para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de conexión (Hardcoded para asegurar que es la correcta)
const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

// Mapeo de archivos a funciones de importación
const FILES_MAP = {
    '2_roles.csv': { table: 'user_roles', type: 'roles' },
    '3_areas.csv': { table: 'assets', type: 'areas' },
    '4_almacenes.csv': { table: 'warehouses', type: 'warehouses' },
    '5_categorias_activos.csv': { table: 'asset_categories', type: 'asset-categories' },
    '6_equipos.csv': { table: 'assets', type: 'assets' },
    '7_categorias_inventario.csv': { table: 'inventory_categories', type: 'inventory-categories' },
    '8_items_inventario.csv': { table: 'inventory_items', type: 'inventory-items' },
    '9_usuarios.csv': { table: 'users', type: 'users' },
    '10_tareas_mantenimiento.csv': { table: 'maintenance_tasks', type: 'maintenance-tasks' },
    '11_turnos.csv': { table: 'shifts', type: 'shifts' }
};

async function runBulkImport() {
    console.log("---------------------------------------------------");
    console.log("🚀 INICIANDO IMPORTACIÓN MASIVA DE CATÁLOGOS (2-11)");
    console.log("---------------------------------------------------");

    const client = await pool.connect();

    try {
        const templatesDir = path.join(__dirname, '../data_templates');

        // Iterar en orden numérico, SOLO archivos solicitados (9)
        const allowedPrefixes = ['9_'];
        const files = fs.readdirSync(templatesDir)
            .filter(f => f.endsWith('.csv') && allowedPrefixes.some(prefix => f.startsWith(prefix)))
            .sort((a, b) => parseInt(a) - parseInt(b));

        for (const file of files) {
            if (!FILES_MAP[file]) {
                console.log(`⚠️  Saltando archivo desconocido: ${file}`);
                continue;
            }

            console.log(`\n📂 Procesando: ${file} ...`);
            const csvPath = path.join(templatesDir, file);
            const content = fs.readFileSync(csvPath, 'utf-8');
            const records = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });

            if (records.length === 0) {
                console.log(`   🔸 Archivo vacío.`);
                continue;
            }

            await importFile(client, file, records);
        }

        console.log("\n---------------------------------------------------");
        console.log("🎉  IMPORTACIÓN FINALIZADA CON ÉXITO");
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("❌ ERROR FATAL:", error);
    } finally {
        client.release();
        await pool.end();
    }
}

async function importFile(client, filename, records) {
    const config = FILES_MAP[filename];

    try {
        await client.query('BEGIN');

        // Limpieza específica por tipo
        if (config.type === 'areas') {
            console.log(`   🧹 Limpiando tabla assets (Áreas y Equipos)...`);
            await client.query('TRUNCATE TABLE assets RESTART IDENTITY CASCADE');
        } else if (config.type === 'assets') {
            console.log(`   🧹 Limpiando equipos anteriores...`);
            await client.query("DELETE FROM assets WHERE category != 'AREA' OR category IS NULL");
        } else {
            console.log(`   🧹 Limpiando tabla ${config.table}...`);
            await client.query(`TRUNCATE TABLE ${config.table} RESTART IDENTITY CASCADE`);
        }

        let inserted = 0;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            try {
                // Crear punto de guardado para aislar errores de esta fila
                await client.query(`SAVEPOINT row_${i}`);

                if (config.type === 'roles') {
                    await client.query('INSERT INTO user_roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                }
                else if (config.type === 'areas') {
                    let catRes = await client.query("SELECT id FROM asset_categories WHERE name = 'Área'");
                    let catId;
                    if (catRes.rows.length === 0) {
                        const newCat = await client.query("INSERT INTO asset_categories (name) VALUES ('Área') RETURNING id");
                        catId = newCat.rows[0].id;
                    } else {
                        catId = catRes.rows[0].id;
                    }

                    await client.query(
                        "INSERT INTO assets (name, category_id, status, category) VALUES ($1, $2, 'ACTIVE', 'AREA') ON CONFLICT DO NOTHING",
                        [record.name, catId]
                    );
                }
                else if (config.type === 'warehouses') {
                    let areaId = null;
                    if (record.area_name) {
                        const areaRes = await client.query('SELECT id FROM assets WHERE name = $1 LIMIT 1', [record.area_name]);
                        if (areaRes.rows.length > 0) areaId = areaRes.rows[0].id;
                    }
                    const isPersonal = (record.is_personal === 'TRUE' || record.is_personal === '1');
                    await client.query(
                        'INSERT INTO warehouses (name, area_id, is_personal) VALUES ($1, $2, $3)',
                        [record.name, areaId, isPersonal]
                    );
                }
                else if (config.type === 'asset-categories') {
                    await client.query('INSERT INTO asset_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                }
                else if (config.type === 'assets') {
                    let catId = null;
                    const catRes = await client.query('SELECT id FROM asset_categories WHERE name = $1', [record.category_name]);
                    if (catRes.rows.length > 0) catId = catRes.rows[0].id;

                    let parentId = null;
                    if (record.area_name) {
                        const areaRes = await client.query('SELECT id FROM assets WHERE name = $1 LIMIT 1', [record.area_name]);
                        if (areaRes.rows.length > 0) parentId = areaRes.rows[0].id;
                    }

                    await client.query(
                        "INSERT INTO assets (name, model, serial_number, category_id, parent_id, status) VALUES ($1, $2, $3, $4, $5, 'ACTIVE')",
                        [record.name, record.model || '', record.serial_number || '', catId, parentId]
                    );
                }
                else if (config.type === 'inventory-categories') {
                    await client.query('INSERT INTO inventory_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                }
                else if (config.type === 'inventory-items') {
                    let catId = null;
                    const catRes = await client.query('SELECT id FROM inventory_categories WHERE name = $1', [record.category_name]);
                    if (catRes.rows.length > 0) catId = catRes.rows[0].id;

                    const minStock = parseInt(record.min_stock || 0);
                    const maxStock = parseInt(record.max_stock || 0);

                    await client.query(
                        'INSERT INTO inventory_items (name, description, sku, category_id, min_stock, max_stock, manufacturer) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [record.name, record.description || '', record.sku, catId, minStock, maxStock, record.Manufacturer || record.manufacturer]
                    );
                }
                else if (config.type === 'users') {
                    let roleId = null;
                    if (record.role_name) {
                        const r = await client.query('SELECT id FROM user_roles WHERE name = $1', [record.role_name]);
                        if (r.rows.length > 0) roleId = r.rows[0].id;
                    }
                    let deptId = null;
                    if (record.department_name) {
                        const d = await client.query('SELECT id FROM departments WHERE name = $1', [record.department_name]);
                        if (d.rows.length > 0) deptId = d.rows[0].id;
                    }
                    let whId = null;
                    if (record.default_warehouse_name) {
                        const w = await client.query('SELECT id FROM warehouses WHERE name = $1', [record.default_warehouse_name]);
                        if (w.rows.length > 0) whId = w.rows[0].id;
                    }

                    await client.query(
                        'INSERT INTO users (full_name, email, role_id, department_id, default_warehouse_id, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
                        [record.full_name, record.email, roleId, deptId, whId, record.password || 'default']
                    );
                }
                else if (config.type === 'maintenance-tasks') {
                    const duration = parseFloat(record.estimated_duration_hours || 1);
                    await client.query(
                        "INSERT INTO maintenance_tasks (name, description, type, estimated_duration_hours, base_cost) VALUES ($1, $2, 'PREVENTIVO', $3, 0)",
                        [record.name, record.description || '', duration]
                    );
                }
                else if (config.type === 'shifts') {
                    const hours = parseFloat(record.daily_hours || 8);
                    await client.query('INSERT INTO shifts (name, description, daily_hours) VALUES ($1, $2, $3)', [record.name, record.description || '', hours]);
                }

                // Liberar savepoint si todo salió bien
                await client.query(`RELEASE SAVEPOINT row_${i}`);
                inserted++;

            } catch (rowErr) {
                // Revertir solo esta fila, permitiendo que las demás continúen
                await client.query(`ROLLBACK TO SAVEPOINT row_${i}`);
                console.error(`      ❌ Error en fila ${i + 2}: ${rowErr.message}`);
            }
        }

        await client.query('COMMIT');
        console.log(`   ✅ Insertados: ${inserted}`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`   ❌ ERROR AL IMPORTAR ${filename}:`, err);
    }
}

runBulkImport();
