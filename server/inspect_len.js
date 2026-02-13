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

async function inspect() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'areas' AND column_name = 'image_url'
        `);
        console.log(res.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
