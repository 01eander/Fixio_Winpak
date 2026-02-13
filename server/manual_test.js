import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

// Helper para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env manualmente (ya que dotenv falla con ESM a veces si no está bien config)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function runManualImport() {
    console.log("---------------------------------------------------");
    console.log("🛠️  INICIANDO IMPORTACIÓN MANUAL DE DEPARTAMENTOS");
    console.log("---------------------------------------------------");

    try {
        const csvPath = path.join(__dirname, '../data_templates/1_departamentos.csv');
        console.log(`📂 Leyendo archivo: ${csvPath}`);

        if (!fs.existsSync(csvPath)) {
            console.error("❌ Archivo no encontrado.");
            return;
        }

        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        console.log(`📄 Leído: ${fileContent.substring(0, 50)}...`);

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true
        });

        console.log(`📊 Total Registros: ${records.length}`);

        console.log("🔌 Conectando a BD...");
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Limpieza
            console.log("🧹 Limpiando tabla departments...");
            await client.query('TRUNCATE TABLE departments RESTART IDENTITY CASCADE');

            let inserted = 0;
            for (const record of records) {
                const name = record.name ? record.name.trim() : null;
                if (!name) continue;

                const res = await client.query(
                    'INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
                    [name]
                );

                if (res.rowCount > 0) {
                    console.log(`   ✅ Insertado ID ${res.rows[0].id}: "${name}"`);
                    inserted++;
                } else {
                    console.log(`   ⚠️ Duplicado: "${name}"`);
                }
            }

            await client.query('COMMIT');
            console.log("\n---------------------------------------------------");
            console.log(`🎉 IMPORTACIÓN EXITOSA: ${inserted} departamentos insertados en la Base de Datos.`);
            console.log("---------------------------------------------------");

        } catch (err) {
            await client.query('ROLLBACK');
            console.error("❌ ERROR SQL:", err);
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("❌ ERROR GENERAL:", error);
    } finally {
        await pool.end();
    }
}

runManualImport();
