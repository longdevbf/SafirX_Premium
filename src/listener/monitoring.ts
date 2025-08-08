
export const MONITORING_CONFIG = {
    // URL cho UptimeRobot ping (Railway domain thật)
    healthCheckUrl: 'https://safirx-premium-production.up.railway.app/health',
    
    // Cấu hình UptimeRobot (free plan)
    uptimeRobot: {
        monitorType: 'HTTP(s)',
        url: 'https://safirx-premium-production.up.railway.app/health',
        monitorFriendlyName: 'SafirX Blockchain Listeners',
        monitorInterval: 300, // 5 phút (minimum free plan)
        monitorTimeout: 30,
        monitorKeyword: 'alive', // Keyword để check response
        httpMethod: 'GET',
    },
    
    // Cấu hình cho Pingdom (alternative)
    pingdom: {
        url: 'https://safirx-premium-production.up.railway.app/ping',
        name: 'SafirX Listeners Heartbeat',
        type: 'http',
        sendNotificationWhenDown: 2, // minutes
        notificationWhenBackup: true,
    }
};

// Hướng dẫn setup UptimeRobot
export const SETUP_INSTRUCTIONS = {
    step1: 'Đăng ký miễn phí tại https://uptimerobot.com',
    step2: 'Tạo monitor mới với URL: https://safirx-premium-production.up.railway.app/health',
    step3: 'Set monitoring interval: 5 minutes (free plan)',
    step4: 'Add keyword monitoring: "alive"',
    step5: 'Configure email/SMS alerts khi service down',
    step6: 'UptimeRobot sẽ ping service mỗi 5 phút để giữ nó alive',
    
    benefits: [
        '✅ Miễn phí cho 50 monitors',
        '✅ Ping mỗi 5 phút giữ Railway service alive', 
        '✅ Email/SMS alerts khi service down',
        '✅ 90-day statistics',
        '✅ Public status pages'
    ]
};

// Health check response format
export interface HealthCheckResponse {
    status: 'alive' | 'down';
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    listeners: {
        auction: 'running' | 'stopped';
        market: 'running' | 'stopped';
    };
    lastActivity: {
        auction: string;
        market: string;
    };
}
