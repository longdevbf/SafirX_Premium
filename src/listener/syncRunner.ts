import { startSyncService } from './syncService';
import { runMigration } from '../scripts/migrate';

async function runSyncServiceInBackground() {
    try {
        await runMigration();    
        await startSyncService();
        process.on('SIGINT', () => {
            //('\n🛑 Gracefully shutting down...');
            process.exit(0);
        });
        setInterval(() => {
        }, 60000); 
    } catch (error) {
        //('❌ Failed to start sync service runner:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runSyncServiceInBackground().catch();
}

export { runSyncServiceInBackground };
