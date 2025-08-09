import { Pool} from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variable
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon database
    },
    // Connection pool settings for better performance
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout for Neon
});

// async function main() {
//     console.log('🔄 Testing database connection...');
    
//     let connectdb: PoolClient;
//     try {
//         connectdb = await pool.connect();
        
//         // Test the connection with a simple query
//         const result = await connectdb.query('SELECT NOW() as current_time, version() as postgres_version');
        
//         console.log('✅ Kết nối đến cơ sở dữ liệu thành công!');
//         console.log(`🕐 Current time: ${result.rows[0].current_time}`);
//         console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
        
//         // Test creating a simple table to verify write permissions
//         await connectdb.query(`
//             CREATE TABLE IF NOT EXISTS connection_test (
//                 id SERIAL PRIMARY KEY,
//                 test_message TEXT,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )
//         `);
        
//         console.log('✅ Database write test successful!');
        
//     } catch (error) {
//         console.error('❌ Lỗi kết nối đến cơ sở dữ liệu:', error);
        
//         // Provide more specific error information
//         if (error instanceof Error) {
//             if (error.message.includes('ECONNREFUSED')) {
//                 console.error('💡 Suggestion: Check if DATABASE_URL is correct and the database server is running');
//             } else if (error.message.includes('authentication')) {
//                 console.error('💡 Suggestion: Check database credentials in DATABASE_URL');
//             } else if (error.message.includes('SSL')) {
//                 console.error('💡 Suggestion: SSL connection issue - verify SSL configuration');
//             }
//         }
        
//         process.exit(1);
//     } finally {
//         if (connectdb!) {
//             connectdb.release();
//         }
//         // Close the pool to end the process
//         await pool.end();
//     }
// }

// // Graceful shutdown handlers
// process.on('SIGINT', async () => {
//     console.log('\n🔄 Closing database pool...');
//     await pool.end();
//     console.log('✅ Database pool closed');
//     process.exit(0);
// });

// process.on('SIGTERM', async () => {
//     console.log('\n🔄 Closing database pool...');
//     await pool.end();
//     console.log('✅ Database pool closed');
//     process.exit(0);
// });

// // Run the test if this file is executed directly
// if (require.main === module) {
//     main();
// }