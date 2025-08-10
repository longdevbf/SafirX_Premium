'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, Square, Activity, Database } from 'lucide-react';

interface SyncStatus {
    success: boolean;
    serviceStatus: {
        isRunning: boolean;
        intervalMs: number | null;
    };
    syncStatus: Array<{
        service: string;
        last_synced_block: number;
        updated_at: string;
    }>;
    dataCounts: {
        totalAuctions: number;
        totalListings: number;
    };
    lastUpdated: string;
}

export default function SyncMonitor() {
    const [status, setStatus] = useState<SyncStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/sync/status');
            const data = await response.json();
            
            if (data.success) {
                setStatus(data);
            } else {
                setError(data.error || 'Failed to fetch status');
            }
        } catch (err) {
            setError('Network error');
      //      //('Error fetching sync status:', err);
        } finally {
            setLoading(false);
        }
    };

    const startService = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sync/start', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                await fetchStatus();
            } else {
                setError(data.error || 'Failed to start service');
            }
        } catch (err) {
            setError('Network error');
     //       //('Error starting sync service:', err);
        } finally {
            setLoading(false);
        }
    };

    const stopService = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sync/stop', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                await fetchStatus();
            } else {
                setError(data.error || 'Failed to stop service');
            }
        } catch (err) {
            setError('Network error');
     //       //('Error stopping sync service:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Blockchain Sync Monitor</h1>
                <Button onClick={fetchStatus} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {status && (
                <>
                    {/* Service Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Sync Service Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge 
                                        variant={status.serviceStatus.isRunning ? "default" : "secondary"}
                                        className={status.serviceStatus.isRunning ? "bg-green-500" : ""}
                                    >
                                        {status.serviceStatus.isRunning ? "Running" : "Stopped"}
                                    </Badge>
                                    {status.serviceStatus.intervalMs && (
                                        <span className="text-sm text-gray-600">
                                            Sync every {status.serviceStatus.intervalMs / 1000}s
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={startService} 
                                        disabled={loading || status.serviceStatus.isRunning}
                                        size="sm"
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Start
                                    </Button>
                                    <Button 
                                        onClick={stopService} 
                                        disabled={loading || !status.serviceStatus.isRunning}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Square className="h-4 w-4 mr-1" />
                                        Stop
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Block Sync Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Block Synchronization</CardTitle>
                            <CardDescription>Last synced blocks for each service</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {status.syncStatus.map((service) => (
                                    <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium capitalize">{service.service} Service</p>
                                            <p className="text-sm text-gray-600">
                                                Last updated: {formatDate(service.updated_at)}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            Block #{service.last_synced_block.toLocaleString()}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Counts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Database Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {status.dataCounts.totalAuctions.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Auctions</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {status.dataCounts.totalListings.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Listings</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                Last updated: {formatDate(status.lastUpdated)}
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

