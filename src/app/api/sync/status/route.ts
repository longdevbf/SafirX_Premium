import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSyncServiceStatus } from '@/listener/syncService';

export async function GET() {
    const client = await pool.connect();
    try {
        // Get sync status from database
        const syncStatusResult = await client.query(`
            SELECT service, last_synced_block, updated_at 
            FROM sync_status 
            ORDER BY service
        `);
        
        // Get counts from tables
        const auctionCount = await client.query('SELECT COUNT(*) FROM auctions');
        const marketCount = await client.query('SELECT COUNT(*) FROM market_listings');
        
        // Get service running status
        const serviceStatus = getSyncServiceStatus();
        
        return NextResponse.json({
            success: true,
            serviceStatus,
            syncStatus: syncStatusResult.rows,
            dataCounts: {
                totalAuctions: parseInt(auctionCount.rows[0].count),
                totalListings: parseInt(marketCount.rows[0].count)
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
   //     //('Error getting sync status:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to get sync status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        client.release();
    }
}
