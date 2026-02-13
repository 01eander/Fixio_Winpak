const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function verify() {
    const client = await pool.connect();
    console.log('--- Verifying Equipment Hierarchy ---');
    try {
        const query = `
            WITH RECURSIVE equipment_tree AS (
                -- Anchor member: root nodes (parent_id IS NULL)
                SELECT 
                    id, 
                    name, 
                    parent_id, 
                    area_id,
                    0 as level, 
                    name::text as path
                FROM equipment
                WHERE parent_id IS NULL AND area_id IS NOT NULL
                
                UNION ALL
                
                -- Recursive member: children
                SELECT 
                    e.id, 
                    e.name, 
                    e.parent_id, 
                    e.area_id,
                    et.level + 1, 
                    (et.path || ' -> ' || e.name)::text
                FROM equipment e
                INNER JOIN equipment_tree et ON e.parent_id = et.id
            )
            SELECT level, path FROM equipment_tree ORDER BY path LIMIT 50;
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('No equipment found.');
        } else {
            res.rows.forEach(row => {
                console.log(`${'  '.repeat(row.level)}${row.path}`);
            });
            console.log(`\nTotal displayed: ${res.rows.length}`);
        }

    } catch (err) {
        console.error('Error verifying:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

verify();
