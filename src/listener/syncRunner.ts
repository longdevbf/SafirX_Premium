#!/usr/bin/env node
/**
 * Sync Service Runner
 * Tự động start sync service và chạy background
 */

import { startSyncService } from './syncService';
import { runMigration } from '../scripts/migrate';

async function runSyncServiceInBackground() {
    console.log('🚀 Starting Sync Service Runner...');
    
    try {
        // Step 1: Ensure database migration is run
        console.log('📁 Ensuring database migration...');
        await runMigration();
        
        // Step 2: Start sync service
        console.log('🔄 Starting automatic sync service...');
        await startSyncService();
        
        console.log('✅ Sync service is now running in background!');
        console.log('📊 Monitoring blockchain events every 30 seconds...');
        console.log('🛑 Use Ctrl+C to stop the service');
        
        // Keep the process alive
        process.on('SIGINT', () => {
            console.log('\n🛑 Gracefully shutting down...');
            process.exit(0);
        });
        
        // Prevent the process from exiting
        setInterval(() => {
            // Keep alive
        }, 60000); // Check every minute
        
    } catch (error) {
        console.error('❌ Failed to start sync service runner:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    runSyncServiceInBackground().catch(console.error);
}

export { runSyncServiceInBackground };
