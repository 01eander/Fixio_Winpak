const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 54321,
    database: 'oFixio_db',
});

// Forzar salida de error
pool.query('SELECT name FROM user_roles', (err, res) => {
    if (err) {
        console.error('ERROR:', err);
    } else {
        console.log('✅ ROLES EXISTENTES:');
        console.table(res.rows);
    }
    pool.end();
});
