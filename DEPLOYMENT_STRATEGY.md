# 🚀 SafirX Railway Deployment Strategy

## 🎯 **Current Setup Analysis:**

✅ **Railway Config (railway.toml):**
- `startCommand = "npm run start:listeners"` ← **Backend-focused**
- `healthcheckPath = "/health"` ← **UptimeRobot ready**
- Fast pre-deploy script ← **Fixed deployment hanging**

✅ **Package.json Scripts:**
- `start:listeners` → `npx tsx src/listener/index.ts` ← **Unified listeners**
- `start:frontend` → `next start` ← **Frontend ready**
- `start:full` → **Both** concurrently

## 🔥 **Recommended Deployment Strategy:**

### **Phase 1: Backend-Only Deployment (PRIORITY)**
```toml
# railway.toml - Backend focus
[deploy]
startCommand = "npm run start:listeners"
healthcheckPath = "/health"
```

**Benefits:**
- 🎯 Focus on blockchain listeners stability
- 📡 UptimeRobot keeps service alive
- 💡 Faster deployment & debugging
- 🔄 Database sync works perfectly

### **Phase 2: Add Frontend (Optional)**
```toml
# railway.toml - Full stack
[deploy]
startCommand = "npm run start:full"
healthcheckPath = "/health"
```

**Or better: Split deployment**
- **Railway**: Backend listeners only
- **Vercel**: Frontend only (faster builds)

## 📊 **UptimeRobot Setup:**

### **Step 1: Create Monitor**
1. Go to https://uptimerobot.com
2. Add New Monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://safirx-premium-production.up.railway.app/health`
   - **Name**: "SafirX Blockchain Listeners"
   - **Monitoring Interval**: 5 minutes
   - **Keyword**: "alive"

### **Step 2: Verify Health Endpoint**
Check if `/health` endpoint works:
```bash
curl https://safirx-premium-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "alive",
  "timestamp": "2025-08-10T...",
  "uptime": 12345,
  "listeners": {
    "auction": "running",
    "market": "running"
  }
}
```

## ⚡ **Deployment Commands:**

### **Deploy Backend Now:**
```bash
# Commit & push current changes
git add .
git commit -m "🚀 Deploy unified blockchain listeners to Railway

- Fixed RPC limit issues (50 blocks per query)
- Unified listener architecture (index.ts)
- Comprehensive event handling (all auction/market events)
- Ready for UptimeRobot monitoring"

git push origin main
```

### **Monitor Deployment:**
1. Watch Railway logs in dashboard
2. Check health endpoint: `/health`
3. Setup UptimeRobot monitoring
4. Verify blockchain events are syncing

## 🎯 **Success Metrics:**
- ✅ Railway service starts without errors
- ✅ Health endpoint returns "alive"
- ✅ UptimeRobot shows service UP
- ✅ Database receives blockchain events
- ✅ No RPC limit errors in logs

## 🔧 **Troubleshooting:**
- **If deployment hangs**: Fast pre-deploy script should fix
- **If listeners crash**: Check RPC rate limits
- **If health fails**: Verify keepAlive.ts is imported first
- **If UptimeRobot shows down**: Check Railway domain spelling
