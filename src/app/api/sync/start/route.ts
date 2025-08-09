import { NextResponse } from 'next/server';
import { startSyncService, getSyncServiceStatus } from '@/listener/syncService';

export async function POST() {
    try {
        const status = getSyncServiceStatus();
        
        if (status.isRunning) {
            return NextResponse.json({ 
                success: true, 
                message: 'Sync service is already running',
                status 
            });
        }
        
        await startSyncService();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Sync service started successfully',
            status: getSyncServiceStatus()
        });
    } catch (error) {
        console.error('Error starting sync service:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to start sync service',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const status = getSyncServiceStatus();
        return NextResponse.json({
            success: true,
            status
        });
    } catch (error) {
        console.error('Error getting sync service status:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to get sync service status' 
        }, { status: 500 });
    }
}
