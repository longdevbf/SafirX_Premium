import { NextResponse } from 'next/server';
import { stopSyncService, getSyncServiceStatus } from '@/listener/syncService';

export async function POST() {
    try {
        await stopSyncService();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Sync service stopped successfully',
            status: getSyncServiceStatus()
        });
    } catch (error) {
        console.error('Error stopping sync service:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to stop sync service',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
