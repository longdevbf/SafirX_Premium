import express, { Request, Response } from 'express';
import { createServer } from 'http';
const app = express();
const server = createServer(app);

setInterval(async () => {
    try {
        const baseUrl = process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`;
        const response = await fetch(`${baseUrl}/ping`);
        const data = await response.json();
        console.log('🔄 Self-ping successful:', data.message);
    } catch (error) {
        console.log('⚠️ Self-ping failed (normal for Railway):', (error as Error)?.message || 'Unknown error');
    }
}, 10 * 60 * 1000); 
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'alive', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

app.get('/ping', (req: Request, res: Response) => {
    res.json({ 
        message: 'pong', 
        timestamp: Date.now() 
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        service: 'SafirX Blockchain Listeners',
        status: 'running',
        endpoints: ['/health', '/ping']
    });
});

const PORT = process.env.PORT || 3001;

// Start server
server.listen(PORT, () => {
    console.log(`✅ Keep-alive server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Self-ping để giữ process hoạt động
setInterval(async () => {
    try {
        const response = await fetch(`http://localhost:${PORT}/ping`);
        const data = await response.json();
        console.log(`🔄 Self-ping successful:`, data.timestamp);
    } catch (error) {
        console.error('❌ Self-ping failed:', error);
    }
}, 5 * 60 * 1000); // Ping mỗi 5 phút
export { server, app };
