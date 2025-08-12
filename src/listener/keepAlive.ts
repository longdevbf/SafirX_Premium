import express, { Request, Response } from 'express';
import { createServer } from 'http';
const app = express();
const server = createServer(app);

setInterval(async () => {
    try {
        const baseUrl = process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`;
        const response = await fetch(`${baseUrl}/ping`);
        const data = await response.json();
    } catch (error) {
        
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

server.listen(PORT, () => {
});

// Self-ping để giữ process hoạt động
setInterval(async () => {
    try {
        const response = await fetch(`http://localhost:${PORT}/ping`);
        const data = await response.json();
        
    } catch (error) {
        
    }
}, 5 * 60 * 1000);
export { server, app };
