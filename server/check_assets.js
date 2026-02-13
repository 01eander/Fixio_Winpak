const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

async function checkColumns() {
    try {
        const res = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('areas', 'equipment') ORDER BY table_name, ordinal_position");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkColumns();
