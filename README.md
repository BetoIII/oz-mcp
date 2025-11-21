# Opportunity Zone Search MCP Server

A Next.js-based MCP (Model Context Protocol) server that provides opportunity zone search functionality with OAuth 2.1 authentication. Features a modern web interface for developers and allows users to check if coordinates or addresses are located within designated opportunity zones in the United States.

## ✨ Features

### Core MCP Functionality
- **Opportunity Zone Lookup**: Check if coordinates or addresses are in opportunity zones
- **Address Geocoding**: Convert addresses to coordinates using geocode.maps.co  
- **Listing Address Extraction**: Extract normalized addresses from real estate listing URLs (Zillow, Realtor.com, etc.)
- **PostGIS Spatial Optimization**: Fast point-in-polygon lookups with spatial indexing (91.9% geometry compression)
- **Data Caching**: Persistent caching of GeoJSON data and geocoding results
- **Advanced Rate Limiting**: 30 requests/minute per IP with connection pooling and monitoring

### OAuth 2.1 Integration
- **PKCE Support**: Secure authorization code flow with code challenges
- **Multiple Grant Types**: Authorization code, client credentials, and token refresh
- **API Key Management**: Generate temporary and persistent API keys
- **Client Registration**: Dynamic client registration for third-party applications

### Web Interface
- **Interactive Dashboard**: Manage API keys, view usage statistics
- **Google Maps Integration**: Interactive map display with color-coded opportunity zone markers
- **Places Autocomplete**: Google Places API integration for enhanced address input
- **Real-time Testing**: Test coordinates and addresses directly in the browser with visual feedback
- **MCP Connection Monitoring**: Real-time dashboard at `/monitor` for connection management
- **Developer Documentation**: Complete OAuth flow examples and API reference
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL with PostGIS extension
- A geocoding service API key (geocode.maps.co)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/your-username/oz-mcp.git
   cd oz-mcp
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

3. **Set up the database**:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the web interface.

## 🔧 MCP Client Integration

This server can be integrated with various MCP clients using different transport protocols.

📖 **For detailed setup instructions, see [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md)**

### Option 1: STDIO Transport (Recommended for Goose Block & Local Clients)

The STDIO server provides a direct Node.js interface that works with Goose Block and other local MCP clients.

**For Goose Block:**

1. Get an API key from the dashboard at `http://localhost:3000/dashboard`
2. Add to your Goose Block MCP extensions:
   - **Extension Name**: `localoppzones` (or any name you prefer)
   - **Type**: `STDIO`
   - **Command**: `node /path/to/oz-mcp/mcp-stdio-server.js`
   - **Timeout**: `300`
   - **Environment Variables**:
     - `OZ_MCP_API_KEY`: `your-api-key-here`
     - `OZ_API_URL`: `http://localhost:3000/api/mcp` (optional, defaults to this)

**For Claude Desktop (STDIO):**

Add to your `claude_desktop_config.json`:

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

**For Cursor IDE:**

Create or update `.cursor/mcp.json` in your project:

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

### Option 2: SSE Transport (For Web-Based Clients)

**For Claude Desktop (SSE via Vercel adapter):**

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

**For Cursor IDE (SSE):**

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

### Available Transport Protocols

- **STDIO** (`mcp-stdio-server.js`): Direct Node.js process communication (recommended for local clients)
- **Server-Sent Events (SSE)**: `http://localhost:3000/mcp/sse`
- **HTTP Streaming**: `http://localhost:3000/mcp/http-stream`
- **JSON-RPC**: `http://localhost:3000/api/mcp` (legacy)

## 📚 Available MCP Tools

### `check_opportunity_zone`
Check if coordinates or addresses are within an opportunity zone. Returns the status along with a Google Maps link for easy visualization.

**Parameters:**
- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)
- `address` (string): Full address to check (alternative to coordinates)

**Example:**
```typescript
// Using coordinates
await use_mcp_tool("check_opportunity_zone", {
  latitude: 40.7128,
  longitude: -74.0060
});

// Using address
await use_mcp_tool("check_opportunity_zone", {
  address: "1600 Pennsylvania Avenue NW, Washington, DC 20500"
});
```

**Response includes:**
- Opportunity zone status (in/not in zone)
- Zone ID (if applicable)
- Google Maps link for location visualization
- Data version and metadata

### `geocode_address`
Convert an address to coordinates with caching for improved performance.

**Parameters:** 
- `address` (string): Full address to geocode

**Example:**
```typescript
await use_mcp_tool("geocode_address", {
  address: "1600 Pennsylvania Avenue NW, Washington, DC 20500"
});
```

### `get_listing_address`
Extract a normalized U.S. mailing address from real estate listing URLs. Supports Zillow, Realtor.com, and other major real estate sites.

**Parameters:**
- `url` (string): Real estate listing URL to analyze

**Example:**
```typescript
await use_mcp_tool("get_listing_address", {
  url: "https://www.zillow.com/homedetails/123-Main-St-Somecity-ST-12345/1234567_zpid/"
});
```

**Supported Sites:**
- Zillow
- Realtor.com
- Redfin
- And other major real estate platforms

### `get_oz_status`
Get comprehensive service status including opportunity zone data, geocoding cache, and MCP connection statistics.

**Example:**
```typescript
await use_mcp_tool("get_oz_status", {});
```

**Response includes:**
- Service initialization status
- Data version and feature count
- Geocoding cache statistics
- Active MCP connections
- Connection limits and rate limiting status

## 🔐 OAuth 2.1 Implementation

### Authorization Flow

1. **Client Registration**:
   ```bash
   curl -X POST http://localhost:3000/api/oauth/register \\
     -H "Content-Type: application/json" \\
     -d '{"client_name": "Your App", "redirect_uris": ["http://localhost:8080/callback"]}'
   ```

2. **Authorization Request**:
   ```
   GET /oauth/authorize?response_type=code&client_id=CLIENT_ID&state=STATE&code_challenge=CHALLENGE&code_challenge_method=S256&redirect_uri=CALLBACK_URL
   ```

3. **Token Exchange**:
   ```bash
   curl -X POST http://localhost:3000/api/oauth/token \\
     -H "Content-Type: application/x-www-form-urlencoded" \\
     -d "grant_type=authorization_code&code=AUTH_CODE&client_id=CLIENT_ID&code_verifier=VERIFIER"
   ```

### API Authentication

Use the access token in requests:
```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \\
  "http://localhost:3000/api/opportunity-zones/check?lat=40.7128&lng=-74.0060"
```

## 🗄️ Database Schema

The application uses PostgreSQL with PostGIS for spatial data:

- **PostGIS Extension**: Enabled for spatial operations
- **Optimized Geometry**: 91.9% compression using `ST_SimplifyPreserveTopology`
- **Spatial Indexing**: GIST indexes for fast point-in-polygon queries
- **OAuth Tables**: Secure client and token management

Key tables:
- `opportunity_zones_optimized`: Spatial geometry data with GIST indexing
- `oauth_clients`: Registered OAuth applications  
- `oauth_authorization_codes`: Temporary authorization codes
- `oauth_access_tokens`: Issued access tokens

## ⚡ Performance & Monitoring

- **Spatial Queries**: Sub-100ms response times for coordinate lookups
- **Geocoding Cache**: Persistent caching reduces external API calls
- **Connection Pooling**: Advanced MCP connection management with 10 concurrent connection limit
- **Rate Limiting**: 30 requests/minute per IP with rolling windows
- **Real-time Monitoring**: Connection dashboard at `/monitor` with live statistics
- **Automated Cleanup**: Stale connection detection and removal
- **Security**: Chrome extension and undici client blocking for SSE endpoints

## 📖 API Documentation

### REST Endpoints

- `GET /api/opportunity-zones/check` - Check coordinates for opportunity zone status
- `POST /api/opportunity-zones/geocode` - Geocode address to coordinates
- `POST /api/listing-address` - Extract normalized address from listing URL
- `GET /api/opportunity-zones/status` - API status and service metrics
- `POST /api/oauth/register` - Register OAuth client
- `POST /api/oauth/token` - Exchange authorization codes for tokens
- `GET /api/mcp-monitor` - MCP connection statistics and health

### MCP Endpoints

- `/api/mcp` - Legacy JSON-RPC MCP implementation
- `/mcp/sse` - Modern Vercel MCP adapter with SSE transport
- `/mcp/http-stream` - HTTP streaming transport

### Rate Limits & Usage

- **Temporary Keys**: 5 requests per key
- **Authenticated Users**: 5 free searches per month (rolling 30-day window)
- **MCP Connections**: Maximum 10 concurrent connections (reduced for memory management)
- **Rate Limiting**: 10 requests per minute per IP address (aggressive limits for SSE)
- **Connection Timeout**: 60 seconds max duration (serverless optimization)
- **Idle Timeout**: 30 seconds (aggressive cleanup)
- **Premium**: Custom limits available through dashboard

## 🧪 Testing

```bash
# Run all tests using Node.js test runner
npm run test

# Run critical business logic tests
npm run test:critical

# Run Google Maps and MCP integration tests
npm run test:oz

# Run all test files
npm run test:all
```

### Test Categories

**Critical Business Logic:**
- Monthly usage limits with 30-day rolling windows
- PostGIS spatial query performance and accuracy
- Authentication utilities and security
- Rate limiting and connection management
- Usage tracking and reset logic

**Integration Tests:**
- Google Maps URL generation and embedding
- MCP tool responses and error handling
- Geocoding service with caching
- Real estate listing address extraction

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push

### Environment Variables

Required variables:
```env
DATABASE_URL=postgresql://...
GEOCODING_API_KEY=your-geocoding-key
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## 📊 Monitoring & Operations

### MCP Connection Monitoring

The application includes comprehensive monitoring capabilities for MCP connections:

- **Real-time Dashboard**: Visit `/monitor` for live connection statistics
- **Connection Management**: Automatic cleanup of stale connections with heartbeat monitoring
- **Rate Limit Tracking**: Per-IP request monitoring with rolling windows
- **Security Monitoring**: Detection and blocking of unwanted clients (Chrome extensions, undici)

### CLI Monitoring Tool

```bash
# Make the script executable
chmod +x scripts/monitor-mcp.sh

# Start continuous monitoring
./scripts/monitor-mcp.sh monitor

# Check health once
./scripts/monitor-mcp.sh health

# View recent logs
./scripts/monitor-mcp.sh logs
```

### API Monitoring Endpoints

```bash
# Get connection statistics
curl https://your-domain.com/api/mcp-monitor

# Check specific stats
curl https://your-domain.com/api/mcp-monitor?action=connections
curl https://your-domain.com/api/mcp-monitor?action=ratelimits
curl https://your-domain.com/api/mcp-monitor?action=health
```

For detailed monitoring documentation, see `MCP_MONITORING.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Visit our [comprehensive guides](https://modelcontextprotocol.io/docs)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/BetoIII/oz-mcp/issues)
- **Community**: Join our [Discord](https://discord.gg/your-server)

## 🙏 Acknowledgments

- **Opportunity Zone Data**: U.S. Treasury Department
- **Geocoding**: geocode.maps.co service
- **Spatial Operations**: PostGIS community
- **MCP Protocol**: Anthropic's Model Context Protocol

## 📚 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs)
- [OAuth 2.1 Specification](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built with ❤️ for the developer community** | [Privacy Policy](http://localhost:3000/legal/privacy-policy) | [Terms of Service](http://localhost:3000/legal/terms-of-service)
