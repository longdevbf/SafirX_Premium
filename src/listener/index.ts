
import './keepAlive'; // Start HTTP server first
import { startSyncService } from './syncService';

async function main() {
    try {
        // Start the unified sync service (includes both real-time events and catch-up sync)
        //(' Starting comprehensive sync service...');
        await startSyncService();
        
        // Import and start real-time auction listener
        //('Starting real-time auction listener...');
        await import('./auctionListener');
        
        // Import and start real-time market listener  
        //('Starting real-time market listener...');
        await import('./marketListener');
        
        //('All services started successfully!');
        //('System Status:');
        
    } catch (error) {
        //('❌ Failed to start services:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    //('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    //('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start everything
main().catch();
