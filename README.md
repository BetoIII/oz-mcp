# Opportunity Zone Search MCP Server

A Next.js-based MCP (Model Context Protocol) server that provides opportunity zone search functionality with OAuth 2.1 authentication. Features a modern web interface for developers and allows users to check if coordinates or addresses are located within designated opportunity zones in the United States.

## ✨ Features

### Core MCP Functionality
- **Opportunity Zone Lookup**: Check if coordinates or addresses are in opportunity zones
- **Address Geocoding**: Convert addresses to coordinates using geocode.maps.co  
- **PostGIS Spatial Optimization**: Fast point-in-polygon lookups with spatial indexing (91.9% geometry compression)
- **Data Caching**: Persistent caching of GeoJSON data and geocoding results
- **Rate Limiting**: Built-in request throttling to prevent API abuse

### OAuth 2.1 Integration
- **PKCE Support**: Secure authorization code flow with code challenges
- **Multiple Grant Types**: Authorization code, client credentials, and token refresh
- **API Key Management**: Generate temporary and persistent API keys
- **Client Registration**: Dynamic client registration for third-party applications

### Web Interface
- **Interactive Dashboard**: Manage API keys, view usage statistics
- **Real-time Testing**: Test coordinates and addresses directly in the browser
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

## 🔧 MCP Integration

### For Claude Desktop

Add to your Claude Desktop configuration:

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

### For Other MCP Clients

The server supports multiple transport protocols:
- **Server-Sent Events (SSE)**: `http://localhost:3000/mcp/sse`
- **HTTP Streaming**: `http://localhost:3000/mcp/http-stream`

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
Convert an address to coordinates and check opportunity zone status.

**Parameters:** 
- `address` (string): Full address to geocode

**Example:**
```typescript
await use_mcp_tool("geocode_address", {
  address: "1600 Pennsylvania Avenue NW, Washington, DC 20500"
});
```

### `validate_search_params`
Validate search parameters before making requests.

**Parameters:**
- `params` (object): Search parameters to validate

### `get_api_status`
Get current API status and rate limiting information.

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

## ⚡ Performance

- **Spatial Queries**: Sub-100ms response times for coordinate lookups
- **Geocoding Cache**: Persistent caching reduces external API calls
- **Connection Pooling**: Efficient database connection management
- **Rate Limiting**: Configurable limits prevent API abuse

## 📖 API Documentation

### REST Endpoints

- `GET /api/opportunity-zones/check` - Check coordinates
- `POST /api/opportunity-zones/geocode` - Geocode address
- `GET /api/opportunity-zones/status` - API status
- `POST /api/oauth/register` - Register OAuth client
- `POST /api/oauth/token` - Exchange tokens

### Rate Limits

- **Free tier**: 100 requests per hour
- **Authenticated**: 1000 requests per hour  
- **Premium**: Custom limits available

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific functionality
npm run test:oauth
npm run test:opportunity-zones
npm run test:mcp

# Load testing
npm run test:load
```

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
