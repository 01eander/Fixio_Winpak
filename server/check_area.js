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

async function checkArea(id) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM areas WHERE id = $1', [id]);
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error('Error checking area:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

const id = process.argv[2] || 5;
checkArea(id);
