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

async function cleanup() {
    const client = await pool.connect();
    try {
        console.log('Cleaning up data...');
        await client.query("UPDATE areas SET image_url = REPLACE(image_url, '/api/uploads/', '') WHERE image_url LIKE '/api/uploads/%'");
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

cleanup();
