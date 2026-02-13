const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(res.rows.map(r => r.table_name));
    } finally {
        client.release();
        await pool.end();
    }
}

run();
