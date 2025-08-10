
import './keepAlive'; // Start HTTP server first
import { startSyncService } from './syncService';

async function main() {
    try {
        // Start the unified sync service (includes both real-time events and catch-up sync)
        console.log('🔄 Starting comprehensive sync service...');
        await startSyncService();
        
        // Import and start real-time auction listener
        console.log('🎯 Starting real-time auction listener...');
        await import('./auctionListener');
        
        // Import and start real-time market listener  
        console.log('🏪 Starting real-time market listener...');
        await import('./marketListener');
        
        console.log('✅ All services started successfully!');
        console.log('📊 System Status:');
        
    } catch (error) {
        console.error('❌ Failed to start services:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start everything
main().catch(console.error);
