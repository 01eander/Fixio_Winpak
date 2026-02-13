const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function inspect() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'areas'
        `);
        fs.writeFileSync(path.join(__dirname, 'areas_columns.json'), JSON.stringify(res.rows, null, 2));
        console.log('Results saved to areas_columns.json');
    } catch (err) {
        console.error('Error inspecting:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
