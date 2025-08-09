import { Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, 
});
