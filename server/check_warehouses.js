const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

async function checkWarehouses() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'warehouses'");
        console.log("Warehouses Columns:");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkWarehouses();
