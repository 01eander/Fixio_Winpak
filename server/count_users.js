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

async function count() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT count(*) FROM users');
        console.log('Total users:', res.rows[0].count);
        const list = await client.query('SELECT full_name, email FROM users');
        list.rows.forEach(r => console.log(`- ${r.full_name} (${r.email})`));
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

count();
