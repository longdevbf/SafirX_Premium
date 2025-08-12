
import './keepAlive'; 
import { startSyncService } from './syncService';

async function main() {
    try {
    
        await startSyncService();
        await import('./auctionListener');
        await import('./marketListener');
        
    } catch (error) {
        process.exit(1);
    }
}
process.on('SIGTERM', () => {
    process.exit(0);
});

process.on('SIGINT', () => {
    process.exit(0);
});

// Start everything
main().catch();
