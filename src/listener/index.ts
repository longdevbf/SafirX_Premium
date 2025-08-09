#!/usr/bin/env node
/**
 * SafirX Unified Blockchain Listeners + Sync Service
 * Chạy tất cả: real-time listeners + catch-up sync + keep-alive
 */

import './keepAlive'; // Start HTTP server first
import { startSyncService } from './syncService';

console.log('🚀 Starting SafirX Unified Blockchain Service...');
console.log('📡 HTTP Server + Real-time Listeners + Catch-up Sync');

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
        console.log('   🌐 HTTP Server: http://localhost:3001/health');
        console.log('   🔄 Sync Service: Active (5-minute intervals)');
        console.log('   🎯 Auction Listener: Active (real-time events)');
        console.log('   🏪 Market Listener: Active (real-time events)');
        
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
