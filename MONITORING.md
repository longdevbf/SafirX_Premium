# SafirX Blockchain Listeners - UptimeRobot Setup Guide

## 🚀 Railway Deployment Status

**Service URL**: https://safirx-premium-production.up.railway.app

## 📊 Keep-Alive Monitoring với UptimeRobot

### Bước 1: Đăng ký UptimeRobot (Miễn phí)
1. Truy cập: https://uptimerobot.com
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

### Bước 2: Tạo Monitor Mới
1. **Dashboard** → **Add New Monitor**
2. **Monitor Type**: HTTP(s)
3. **Friendly Name**: `SafirX Blockchain Listeners`
4. **URL**: `https://safirx-premium-production.up.railway.app/health`
5. **Monitoring Interval**: 5 minutes (free plan minimum)

### Bước 3: Cấu hình Advanced Settings
1. **Keyword Monitoring**: 
   - Enable keyword monitoring
   - Keyword: `alive`
   - Alert when keyword NOT found
2. **Request Timeout**: 30 seconds
3. **HTTP Method**: GET

### Bước 4: Setup Notifications
1. **Email Alerts**: 
   - Enable down notifications
   - Enable up notifications
2. **SMS/Slack** (optional): Configure additional channels

### Bước 5: Verify Setup
1. Save monitor
2. Check that first ping is successful
3. Verify "alive" keyword is detected

## 🔧 Endpoints Available

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/health` | Main health check | `{"status":"alive", "timestamp":"...", "uptime":..., "memory":{...}}` |
| `/ping` | Simple ping | `{"message":"pong", "timestamp":...}` |
| `/` | Service info | `{"service":"SafirX Blockchain Listeners", "status":"running", ...}` |

## 📈 Benefits của UptimeRobot

✅ **Miễn phí** cho 50 monitors  
✅ **Keep-alive**: Ping mỗi 5 phút giữ Railway service active  
✅ **Alerts**: Email/SMS khi service down  
✅ **Statistics**: 90-day uptime history  
✅ **Public Status**: Tạo status page công khai  
✅ **API Access**: Programmatic monitoring  

## 🛠️ Troubleshooting

### Nếu health check fail:
1. Kiểm tra Railway deployment logs: `railway logs`
2. Verify service đang chạy: `railway status`
3. Test endpoint manually: Visit URL trực tiếp

### Nếu UptimeRobot báo down:
1. Check keyword "alive" có trong response không
2. Verify HTTP status code = 200
3. Check response time < 30 seconds

## 🚀 Advanced Options

### Multiple Monitoring Services:
- **Pingdom**: Alternative monitoring service
- **StatusCake**: Additional option
- **Custom**: Tự build monitoring dashboard

### Upgrade Railway Plan:
- **Pro Plan ($5/month)**: Always-on, không sleep
- **Better performance**: Faster cold starts
- **More resources**: Higher memory limits

## 📝 Configuration Files

Key files trong project:
- `src/listener/monitoring.ts` - Monitoring configuration
- `src/listener/keepAlive.ts` - Health check server
- `src/listener/index.ts` - Main listener manager
- `railway.toml` - Railway deployment config

---

**Last Updated**: Ngày 8 tháng 8, 2025  
**Status**: ✅ Active monitoring với UptimeRobot  
**Uptime Target**: 99.9%
