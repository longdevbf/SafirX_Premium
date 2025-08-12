/* eslint-disable @typescript-eslint/no-explicit-any */


import { Pool } from 'pg';
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() { 
    const client = await pool.connect();
    
    try {
        // Đọc migration file
        const migrationPath = path.join(process.cwd(), 'migrations', 'create_sync_status_table.sql');
        
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        await client.query(migrationSQL);
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'sync_status'
        `);
        
        if (result.rows.length > 0) {        
            const syncRecords = await client.query('SELECT service, last_synced_block FROM sync_status ORDER BY service');
          syncRecords.rows.forEach((row: any) => {
               
            });
        } else {
          
        }
        
    } catch (error) {
        //('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}
if (require.main === module) {
    runMigration().catch();
}

export { runMigration };
