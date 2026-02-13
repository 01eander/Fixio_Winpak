const db = require('./db');
async function inspect() {
    try {
        const tables = ['equipment', 'users'];
        for (const table of tables) {
            console.log(`--- Schema for ${table} ---`);
            const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(res.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
inspect();
