// Keep-alive service để giữ Railway process luôn hoạt động
import express, { Request, Response } from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'alive', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Ping endpoint để external services có thể ping
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

// Export server cho listener sử dụng
export { server, app };
