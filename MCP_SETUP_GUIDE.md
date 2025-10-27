# MCP Client Setup Guide

Quick reference for integrating the Opportunity Zone MCP Server with various AI clients.

## Prerequisites

1. **Start the Next.js server**:
   ```bash
   npm run dev
   ```
   Server will run at `http://localhost:3000`

2. **Get an API Key**:
   - Visit `http://localhost:3000/dashboard`
   - Sign in with GitHub
   - Generate a new API key
   - Copy the key for use in your MCP client configuration

## Goose Block Configuration

**Best for**: Local development with Goose AI assistant

### Setup Steps:

1. Open Goose Block MCP Extensions settings
2. Click "Add New Extension" or "Update Extension"
3. Configure as follows:
   - **Extension Name**: `localoppzones` (or your preferred name)
   - **Type**: `STDIO`
   - **Command**: `node /Users/YOUR_USERNAME/Applications/oz-mcp/mcp-stdio-server.js`
   - **Timeout**: `300`
   - **Environment Variables**:
     - Key: `OZ_MCP_API_KEY`
     - Value: `your-api-key-from-dashboard`

4. Save the configuration

### Usage Example:

```
Ask Goose: "Check if 1600 Pennsylvania Avenue NW, Washington DC is in an opportunity zone"
```

---

## Claude Desktop Configuration

**Best for**: Claude Desktop app users

### Method 1: STDIO (Recommended)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "opportunity-zones": {
      "command": "node",
      "args": ["/path/to/oz-mcp/mcp-stdio-server.js"],
      "env": {
        "OZ_MCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Method 2: SSE (Alternative)

```json
{
  "mcpServers": {
    "opportunity-zones": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp-adapter", "http://localhost:3000/mcp/sse"],
      "env": {
        "OZ_MCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop after making changes.

---

## Cursor IDE Configuration

**Best for**: Cursor IDE users

### Method 1: STDIO

Create or edit `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "opportunity-zones": {
      "command": "node",
      "args": ["/path/to/oz-mcp/mcp-stdio-server.js"],
      "env": {
        "OZ_MCP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Method 2: SSE

```json
{
  "mcpServers": {
    "opportunity-zones": {
      "url": "http://localhost:3000/mcp/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer your-api-key-here"
      }
    }
  }
}
```

---

## Available MCP Tools

Once configured, your AI assistant will have access to these tools:

### 1. `check_opportunity_zone`
Check if an address or coordinates are in an opportunity zone.

**Parameters:**
- `address` (string): Full address to check
- OR `latitude` (number) and `longitude` (number): Coordinates

**Example:**
```
"Is 123 Main St, Brooklyn, NY in an opportunity zone?"
"Check if coordinates 40.7128, -74.0060 are in an opportunity zone"
```

### 2. `geocode_address`
Convert an address to latitude/longitude coordinates.

**Parameters:**
- `address` (string): Full address to geocode

**Example:**
```
"What are the coordinates for 1600 Pennsylvania Avenue NW, Washington DC?"
```

### 3. `get_listing_address`
Extract a normalized address from a real estate listing URL.

**Parameters:**
- `url` (string): Real estate listing URL (Zillow, Realtor.com, etc.)

**Example:**
```
"Extract the address from this Zillow listing: https://www.zillow.com/..."
```

### 4. `get_oz_status`
Get server status, statistics, and connection information.

**Parameters:** None

**Example:**
```
"What's the status of the opportunity zone service?"
```

---

## Troubleshooting

### "API key is invalid"
- Generate a new key from the dashboard
- Make sure you're using the full key (starts with `temp_` or is a long hex string)
- Check that the Next.js server is running

### "Cannot find module @modelcontextprotocol/sdk"
Run in the project directory:
```bash
npm install --legacy-peer-deps
```

### "Connection timeout"
- Increase the timeout value (try 600 or higher)
- Check that `http://localhost:3000` is accessible
- Verify the API endpoint is responding: `curl http://localhost:3000/api/opportunity-zones/status`

### "Command not found: node"
Ensure Node.js is installed and in your PATH:
```bash
node --version  # Should show v18 or higher
```

### STDIO Server Not Responding
Check the server logs in stderr. Common issues:
- Wrong API URL (should be `http://localhost:3000/api/mcp`)
- Network connectivity issues
- Server not running

### Still Having Issues?

1. **Test the API directly**:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     "http://localhost:3000/api/opportunity-zones/check?lat=40.7128&lng=-74.0060"
   ```

2. **Test the STDIO server**:
   ```bash
   export OZ_MCP_API_KEY="your-key-here"
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-stdio-server.js
   ```

3. **Check server logs**:
   ```bash
   # In the oz-mcp directory
   npm run dev
   # Watch for connection messages
   ```

---

## Production Deployment

When deploying to production (e.g., Vercel):

1. Update the `OZ_API_URL` environment variable to your production URL:
   ```bash
   export OZ_API_URL="https://your-domain.com/api/mcp"
   ```

2. Use a production API key from your deployed dashboard

3. Ensure your firewall/security settings allow the MCP client to reach the production server

---

## Further Reading

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs)
- [Project README](./README.md)
- [OAuth 2.1 Flow Documentation](./docs/oauth-flow/)
- [API Documentation](http://localhost:3000/docs)

---

**Need Help?** Open an issue on [GitHub](https://github.com/BetoIII/oz-mcp/issues)

