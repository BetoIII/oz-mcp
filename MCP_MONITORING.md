# MCP Server Optimization & Monitoring

This document describes the MCP (Model Context Protocol) server optimizations implemented to reduce server load and improve connection management.

## 🚀 Implemented Optimizations

### 1. Connection Limits
- **Maximum concurrent connections**: 10
- **Connection timeout**: 5 minutes of inactivity
- **Idle timeout**: 2 minutes without requests
- Automatic cleanup of stale connections

### 2. Rate Limiting
- **Rate limit**: 30 requests per minute per client IP
- **Window**: Rolling 60-second window
- Automatic rate limit headers in responses:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Timestamp when rate limit resets

### 3. SSE Heartbeat/Keepalive
- **Heartbeat interval**: 30 seconds
- **Heartbeat endpoint**: `/api/mcp-heartbeat`
- Automatic connection health monitoring
- Graceful connection cleanup

### 4. Monitoring & Alerting
- **Real-time monitoring**: Live connection statistics
- **Web dashboard**: `/monitor` - View active connections and server stats
- **CLI monitoring**: `scripts/monitor-mcp.sh` - Command-line monitoring tool
- **Health checks**: Automated endpoint health verification

## 📊 Monitoring Dashboard

### Web Dashboard
Access the monitoring dashboard at: `https://your-domain.com/monitor`

Features:
- Real-time connection statistics
- Active connection details (IP, User Agent, activity)
- Rate limit status
- Server health metrics
- Auto-refresh capability

### API Endpoints

#### Monitor Stats
```bash
GET /api/mcp-monitor
GET /api/mcp-monitor?action=health
GET /api/mcp-monitor?action=connections
GET /api/mcp-monitor?action=ratelimits
```

#### Heartbeat
```bash
GET /api/mcp-heartbeat     # SSE stream with heartbeats
POST /api/mcp-heartbeat    # Get connection stats
```

## 🔧 CLI Monitoring Tool

### Installation
```bash
chmod +x scripts/monitor-mcp.sh
```

### Usage
```bash
# Start continuous monitoring
./scripts/monitor-mcp.sh monitor

# Check health once  
./scripts/monitor-mcp.sh health

# Analyze recent patterns
./scripts/monitor-mcp.sh analyze

# Show recent MCP logs
./scripts/monitor-mcp.sh logs

# Show help
./scripts/monitor-mcp.sh help
```

### Configuration
Set environment variables for alerts:
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
export EMAIL_RECIPIENT="admin@yourdomain.com"
```

## 🏗️ Architecture

### Connection Manager
- `src/lib/mcp-connection-manager.ts` - Core connection management logic
- Tracks active connections, rate limits, and connection health
- Automatic cleanup of stale connections

### Enhanced MCP Route
- `src/app/mcp/[transport]/route.ts` - Enhanced with connection management
- Validates connection limits before processing
- Updates connection activity on each request
- Provides connection details in status endpoint

### Monitoring Components
- `src/app/api/mcp-monitor/route.ts` - Monitoring API endpoint
- `src/app/monitor/page.tsx` - Web monitoring dashboard
- `scripts/monitor-mcp.sh` - CLI monitoring script

## 🚨 Alert Conditions

The monitoring system will alert on:

1. **High error rate**: >20% timeout rate
2. **Connection limit reached**: ≥8 concurrent connections  
3. **Rate limit exceeded**: Client hitting request limits
4. **Consecutive errors**: ≥5 consecutive timeout errors
5. **Endpoint unavailable**: Health check failures

## 📈 Performance Impact

Expected improvements:
- **Reduced timeouts**: Connection limits prevent resource exhaustion
- **Better client behavior**: Rate limiting encourages proper client implementation
- **Faster recovery**: Heartbeat mechanism detects and closes dead connections
- **Improved visibility**: Real-time monitoring enables proactive issue resolution

## 🔧 Configuration

### Connection Limits
```typescript
// In mcp-connection-manager.ts
private readonly MAX_CONNECTIONS = 10;
private readonly MAX_REQUESTS_PER_MINUTE = 30;
private readonly CONNECTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
private readonly HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
```

### Rate Limiting
Rate limits are enforced per client IP address:
- **Window**: 60 seconds
- **Limit**: 30 requests per window
- **Reset**: Rolling window (not fixed intervals)

### Monitoring Intervals
- **Web dashboard**: Auto-refresh every 5 seconds
- **CLI monitor**: Health checks every 5 minutes
- **Heartbeat**: Every 30 seconds
- **Cleanup**: Every 60 seconds

## 🛠️ Troubleshooting

### Common Issues

1. **"Maximum connections exceeded"**
   - Check active connections in monitor dashboard
   - Look for stuck connections that aren't being cleaned up
   - Verify client is properly closing connections

2. **"Rate limit exceeded"**
   - Check if client is making too many requests
   - Implement client-side request debouncing
   - Consider increasing rate limits if legitimate usage

3. **Frequent timeouts**
   - Monitor server resources (memory, CPU)
   - Check for slow database queries
   - Verify network connectivity

### Debug Commands

```bash
# Check current connections
curl https://your-domain.com/api/mcp-monitor?action=connections

# Check rate limits
curl https://your-domain.com/api/mcp-monitor?action=ratelimits  

# Health check
curl https://your-domain.com/api/mcp-monitor?action=health

# Test heartbeat endpoint
curl https://your-domain.com/api/mcp-heartbeat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"stats"}'
```

## 📝 Next Steps

To further optimize:

1. **Add Redis caching** for connection state (for multi-instance deployments)
2. **Implement IP allowlisting** for trusted clients
3. **Add metrics collection** (Prometheus, DataDog, etc.)
4. **Configure automated alerts** (PagerDuty, email, Slack)
5. **Add request logging** for detailed analytics
6. **Implement graceful degradation** under high load

## 🤝 Client Recommendations

For browser extension developers:

1. **Connection pooling**: Reuse connections instead of creating new ones
2. **Request debouncing**: Limit request frequency (e.g., max 1 request per 2 seconds)
3. **Error handling**: Implement exponential backoff on errors
4. **Heartbeat support**: Listen for heartbeat messages to maintain connections
5. **Graceful cleanup**: Close connections when extension is disabled/updated

Example client code:
```javascript
// Debounce requests
const debouncedRequest = debounce(async (data) => {
  try {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Handle response
  } catch (error) {
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 30000)));
  }
}, 2000);
```