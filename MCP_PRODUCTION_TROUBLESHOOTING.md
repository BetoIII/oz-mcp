# MCP Production Connection Troubleshooting

## Issue: "Server disconnected" Error

This document outlines the fixes applied to resolve MCP connection issues in production.

## Root Causes Identified

### 1. ❌ User-Agent Blocking
**Problem:** The server was blocking all `undici` user agents, which many MCP clients (including Claude Desktop) use.

**Fixed:** Modified the blocking logic to only block Chrome extensions while allowing legitimate MCP clients.

### 2. ⏱️ Timeout Configuration
**Problem:** Vercel's function timeout was set to 30 seconds, but SSE connections need to stay open much longer.

**Fixed:** Increased timeout to:
- General routes: 300 seconds (5 minutes)
- MCP SSE endpoint: 900 seconds (15 minutes)

### 3. 🔧 Redis Configuration
**Problem:** The `redisUrl` was passed to `createMcpHandler` even when undefined, potentially causing issues.

**Fixed:** Made Redis optional - SSE will work without it (Redis is only needed for multi-instance synchronization).

## Deployment Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix MCP production connection issues"
   git push
   ```

2. **Verify Vercel deployment:**
   - Wait for Vercel to redeploy
   - Check deployment logs at https://vercel.com/dashboard

3. **Test the connection:**
   - Reconnect Claude Desktop to your MCP server
   - Try calling a tool like `check_opportunity_zone`

## Verifying Your Token

The token in your screenshot might be expired. To get a fresh token:

### Option A: Dashboard (for registered users)
1. Visit https://oz-mcp.vercel.app/dashboard
2. Generate a new API key
3. Update Claude Desktop configuration with new token

### Option B: Temporary Key (for testing)
```bash
curl -X POST https://oz-mcp.vercel.app/api/temporary-key
```

Copy the token from the response and update your Claude Desktop config.

## Testing the Fix

### 1. Check Server Logs
After deployment, test a connection and check Vercel logs for these messages:
```
[MCP] New request from [IP] ([User-Agent])
[MCP] Auth header present: true
[MCP] Token extracted: present
[MCP] Authentication successful, clientId: [ID]
```

### 2. Look for Error Messages
If authentication fails, you'll see:
```
[MCP] Authentication failed - returning 401
```

If user-agent is blocked (shouldn't happen with undici anymore):
```
[MCP] Extension blocked from MCP endpoint
```

### 3. Expected Behavior
- Connection should stay open (not disconnect immediately)
- You should be able to call MCP tools without "Server disconnected" errors
- Rate limiting allows 30 requests per IP per minute

## Claude Desktop Configuration

Your MCP configuration should look like:
```json
{
  "mcpServers": {
    "opportunity-zone": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://oz-mcp.vercel.app/mcp/sse",
        "--header",
        "Authorization: Bearer YOUR_TOKEN_HERE"
      ]
    }
  }
}
```

## Still Having Issues?

### Check Authentication
```bash
curl -X POST https://oz-mcp.vercel.app/mcp/sse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

Expected response: Connection should stay open or return initialization data

### Check Server Status
Visit https://oz-mcp.vercel.app/api/mcp-monitor to see:
- Active connections
- Server health
- Configuration status

### Common Issues

1. **Token expired:** Generate a new token from /dashboard
2. **Database connection:** Ensure `DATABASE_URL` is set in Vercel environment variables
3. **Geocoding not working:** Ensure `GEOCODING_API_KEY` is set
4. **Rate limited:** Wait 1 minute or use a different IP

## Monitoring

View real-time MCP connection status:
- Dashboard: https://oz-mcp.vercel.app/monitor
- API: https://oz-mcp.vercel.app/api/mcp-monitor

## Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `src/app/mcp/[transport]/route.ts` | Removed undici blocking | Allow MCP clients |
| `src/app/mcp/[transport]/route.ts` | Made Redis optional | SSE works without Redis |
| `src/app/mcp/[transport]/route.ts` | Enhanced error messages | Better debugging |
| `vercel.json` | Increased timeouts | Allow long SSE connections |

## Next Steps

1. Deploy these changes to production
2. Generate a fresh API key
3. Update your Claude Desktop configuration
4. Test the connection

The "Server disconnected" error should now be resolved! 🎉

