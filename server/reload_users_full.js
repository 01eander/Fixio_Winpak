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

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Cargando Departamentos
        console.log('--- Cargando Departamentos ---');
        const deptCsv = path.join(__dirname, '../data_templates/1_departamentos.csv');
        const deptContent = fs.readFileSync(deptCsv, 'utf8');
        const deptRecords = parse(deptContent, { columns: true, skip_empty_lines: true, trim: true, bom: true });

        await client.query('TRUNCATE TABLE departments RESTART IDENTITY CASCADE');
        for (const r of deptRecords) {
            if (r.name) await client.query('INSERT INTO departments (name) VALUES ($1) ON CONFLICT DO NOTHING', [r.name.trim()]);
        }
        console.log(`Cargados ${deptRecords.length} departamentos.`);

        // 2. Cargando Roles
        console.log('--- Cargando Roles ---');
        const roleCsv = path.join(__dirname, '../data_templates/2_roles.csv');
        const roleContent = fs.readFileSync(roleCsv, 'utf8');
        const roleRecords = parse(roleContent, { columns: true, skip_empty_lines: true, trim: true, bom: true });

        await client.query('TRUNCATE TABLE roles RESTART IDENTITY CASCADE');
        for (const r of roleRecords) {
            if (r.name) await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT DO NOTHING', [r.name.trim()]);
        }
        console.log(`Cargados ${roleRecords.length} roles.`);

        // 3. Cargando Usuarios
        console.log('--- Cargando Usuarios ---');
        const userCsv = path.join(__dirname, '../data_templates/9_usuarios.csv');
        const userContent = fs.readFileSync(userCsv, 'utf8');
        const userRecords = parse(userContent, { columns: true, skip_empty_lines: true, trim: true, bom: true });

        await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

        let imported = 0;
        for (const r of userRecords) {
            const fullName = r.full_name || '';
            let email = r.email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@winpak.com`;
            const roleName = r.role_name || '';
            const deptName = r.department_name || '';
            const password = r.password || 'temporal123';

            const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
            const roleId = roleRes.rows.length > 0 ? roleRes.rows[0].id : null;

            const deptRes = await client.query('SELECT id FROM departments WHERE name = $1', [deptName]);
            const deptId = deptRes.rows.length > 0 ? deptRes.rows[0].id : null;

            await client.query(
                `INSERT INTO users (full_name, email, role_id, department_id, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5, 'OPERATOR')`,
                [fullName, email, roleId, deptId, password]
            );
            imported++;
        }

        console.log(`Cargados ${imported} usuarios.`);

        // 4. Restaurar Admin
        await client.query(`
            INSERT INTO users (email, password_hash, full_name, role, is_active)
            VALUES ('admin@fixio.com', 'admin123', 'System Administrator', 'ADMIN', TRUE)
            ON CONFLICT (email) DO NOTHING
        `);

        await client.query('COMMIT');
        console.log('¡Sincronización completa!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('ERROR:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
