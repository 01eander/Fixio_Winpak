const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = `
            ALTER TABLE areas ADD COLUMN IF NOT EXISTS description TEXT;
            ALTER TABLE areas ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
        `;
        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        process.exit();
    }
}

runMigration();
