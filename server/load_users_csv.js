const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function loadUsers() {
    console.log('--- Iniciando carga de usuarios ---');
    const csvPath = path.join(__dirname, '../data_templates/9_usuarios.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
    });

    console.log(`Leídos ${records.length} registros.`);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Truncate users table (CASCADE will handle dependent tables if any)
        // Note: Using CASCADE because work_orders, etc might reference users.
        // If this is a fresh start, it's fine.
        console.log('Limpiando tabla users...');
        await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

        let imported = 0;
        let skipped = 0;

        for (const record of records) {
            try {
                const fullName = record.full_name || '';
                let email = record.email || '';
                const roleName = record.role_name || '';
                const deptName = record.department_name || '';
                const warehouseName = record.default_warehouse_name || '';
                const password = record.password || 'temporal123';

                if (!email) {
                    // Generate a fake email for those missing it to avoid NULL constraint error
                    email = `${fullName.toLowerCase().replace(/\s+/g, '.')}@winpak.com`;
                    console.log(`Generando email para ${fullName}: ${email}`);
                }

                // Find Role ID
                let roleId = null;
                if (roleName) {
                    const roleRes = await client.query('SELECT id FROM user_roles WHERE name = $1', [roleName]);
                    if (roleRes.rows.length > 0) roleId = roleRes.rows[0].id;
                }

                // Find Dept ID
                let deptId = null;
                if (deptName) {
                    const deptRes = await client.query('SELECT id FROM departments WHERE name = $1', [deptName]);
                    if (deptRes.rows.length > 0) deptId = deptRes.rows[0].id;
                }

                // Find Warehouse ID
                let warehouseId = null;
                if (warehouseName) {
                    const whRes = await client.query('SELECT id FROM warehouses WHERE name = $1', [warehouseName]);
                    if (whRes.rows.length > 0) warehouseId = whRes.rows[0].id;
                }

                await client.query(
                    `INSERT INTO users (full_name, email, role_id, department_id, default_warehouse_id, password_hash, role)
                     VALUES ($1, $2, $3, $4, $5, $6, 'OPERATOR')`,
                    [fullName, email, roleId, deptId, warehouseId, password]
                );
                imported++;
            } catch (err) {
                console.error(`Error en registro ${record.full_name}:`, err.message);
                skipped++;
            }
        }

        await client.query('COMMIT');
        console.log(`Carga finalizada. Importados: ${imported}, Saltados: ${skipped}`);

        // Insert back the admin user if it was deleted by truncate
        console.log('Restaurando usuario administrador...');
        await client.query(`
            INSERT INTO users (email, password_hash, full_name, role, is_active)
            VALUES ('admin@fixio.com', 'admin123', 'System Administrator', 'ADMIN', TRUE)
            ON CONFLICT (email) DO NOTHING
        `);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error general:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

loadUsers();
