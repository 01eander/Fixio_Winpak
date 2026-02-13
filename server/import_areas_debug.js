import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { parse } from 'csv-parse/sync';
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

async function debugImport() {
    console.log("🐛 DEBUGGING AREAS IMPORT...");
    const client = await pool.connect();

    try {
        const csvPath = path.join(__dirname, '../data_templates/3_areas.csv');
        const content = fs.readFileSync(csvPath, 'utf-8');
        const records = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });

        console.log(`📄 Registros en CSV: ${records.length}`);

        // 1. Verificar Categoría
        const catRes = await client.query("SELECT id FROM asset_categories WHERE name = 'Área'");
        if (catRes.rows.length === 0) {
            console.error("❌ Categoría 'Área' no encontrada.");
            return;
        }
        const catId = catRes.rows[0].id;
        console.log(`✅ Categoría ID: ${catId}`);

        // 2. Insertar uno por uno SIN transaccion para ver errores
        let inserted = 0;
        for (const record of records) {
            try {
                const res = await client.query(
                    "INSERT INTO assets (name, category_id, status, category) VALUES ($1, $2, 'ACTIVE', 'AREA') RETURNING id",
                    [record.name, catId]
                );
                console.log(`   ✅ Insertada Área: ${record.name} (ID: ${res.rows[0].id})`);
                inserted++;
            } catch (err) {
                console.error(`   ❌ Error al insertar '${record.name}':`, err.message);
            }
        }

        console.log(`🏁 Total insertados: ${inserted}`);

    } catch (e) {
        console.error("❌ Error Fatal:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

debugImport();
