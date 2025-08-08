#!/usr/bin/env node
/**
 * SafirX Blockchain Listeners Manager
 * Chạy cả auction và market listeners với keep-alive mechanism
 */

import { fork, ChildProcess } from 'child_process';
import path from 'path';

console.log('🚀 Starting SafirX Blockchain Listeners...');
console.log('📡 Keep-alive mechanism activated');
console.log('🔄 Auto-restart on failures enabled');

// Paths to listener files
const auctionListenerPath = path.join(__dirname, 'auctionListener.ts');
const marketListenerPath = path.join(__dirname, 'marketListener.ts.ts');

let auctionProcess: ChildProcess | null = null;
let marketProcess: ChildProcess | null = null;

// Restart function
function startAuctionListener() {
    console.log('🎯 Starting Auction Listener...');
    auctionProcess = fork(auctionListenerPath, [], {
        env: process.env,
        stdio: 'inherit'
    });

    auctionProcess.on('exit', (code: number) => {
        console.log(`❌ Auction Listener exited with code ${code}. Restarting in 5 seconds...`);
        setTimeout(startAuctionListener, 5000);
    });

    auctionProcess.on('error', (error: Error) => {
        console.error('❌ Auction Listener error:', error);
        setTimeout(startAuctionListener, 5000);
    });
}

function startMarketListener() {
    console.log('🏪 Starting Market Listener...');
    marketProcess = fork(marketListenerPath, [], {
        env: process.env,
        stdio: 'inherit'
    });

    marketProcess.on('exit', (code: number) => {
        console.log(`❌ Market Listener exited with code ${code}. Restarting in 5 seconds...`);
        setTimeout(startMarketListener, 5000);
    });

    marketProcess.on('error', (error: Error) => {
        console.error('❌ Market Listener error:', error);
        setTimeout(startMarketListener, 5000);
    });
}

// Start both listeners
startAuctionListener();
startMarketListener();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    if (auctionProcess) auctionProcess.kill('SIGTERM');
    if (marketProcess) marketProcess.kill('SIGTERM');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    if (auctionProcess) auctionProcess.kill('SIGINT');
    if (marketProcess) marketProcess.kill('SIGINT');
    process.exit(0);
});

// Keep the main process alive
console.log('✅ Listeners Manager started successfully');
console.log('📊 Monitoring both auction and market listeners...');
console.log('🔗 Health check available at http://localhost:3001/health');

// Prevent the main process from exiting
setInterval(() => {
    const memUsage = process.memoryUsage();
    const uptime = Math.floor(process.uptime());
    console.log(`📊 Uptime: ${uptime}s | Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
}, 30 * 60 * 1000); // Log stats every 30 minutes
