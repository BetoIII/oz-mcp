# Opportunity Zone Search MCP Server

A Next.js-based MCP (Model Context Protocol) server that provides opportunity zone search functionality with OAuth 2.1 authentication. Features a modern web interface for developers and allows users to check if coordinates or addresses are located within designated opportunity zones in the United States.

## ✨ Features

### Core MCP Functionality
- **Opportunity Zone Lookup**: Check if coordinates or addresses are in opportunity zones
- **Address Geocoding**: Convert addresses to coordinates using geocode.maps.co  
- **PostGIS Spatial Optimization**: Fast point-in-polygon lookups with spatial indexing (91.9% geometry compression)
- **Data Caching**: Persistent caching of GeoJSON data and geocoding results in PostgreSQL
- **OAuth 2.1 Authentication**: Secure access control with PKCE support and Google OAuth
- **Multiple Transports**: Support for both SSE and Streamable HTTP transports via [@vercel/mcp-adapter](https://github.com/vercel/mcp-adapter)

### Web Interface & Developer Tools
- **🏠 Landing Page**: Modern homepage with interactive search demo and rate limiting
- **📊 Developer Dashboard**: OAuth client management, API key generation, and usage monitoring
- **🛝 API Playground**: Interactive testing environment for all MCP tools and endpoints
- **📚 Documentation**: Comprehensive OAuth flow guide and API documentation
- **🔧 Connection Testing**: Real-time API connectivity and performance testing
- **📱 Responsive Design**: Mobile-first design built with shadcn/ui components
- **🌙 Dark Mode Support**: System-aware theme switching
- **⚡ Real-time Status**: Live service monitoring and cache metrics

## 🛠 MCP Tools

This server provides the following MCP tools:

- **`check_opportunity_zone`** - Check if coordinates or an address is in an opportunity zone
- **`geocode_address`** - Convert an address to coordinates  
- **`get_oz_status`** - Get opportunity zone service status and cache information

## 🌐 Web Interface

Visit the application in your browser to access:

- **Homepage** (`/`) - Interactive search demo with rate limiting
- **Dashboard** (`/dashboard`) - OAuth client management and API keys
- **Playground** (`/playground`) - Interactive API testing environment
- **Documentation** (`/docs/oauth-flow`) - Complete OAuth 2.0 implementation guide
- **Connection Test** (`/test`) - Real-time API connectivity testing

## 📡 API Endpoints

### Core Endpoints
- `POST /api/opportunity-zones/geocode` - Geocode an address to coordinates
- `GET /api/opportunity-zones/check?lat={lat}&lon={lon}` - Check if coordinates are in opportunity zone
- `GET /api/opportunity-zones/status` - Get service status and performance metrics
- `GET /api/opportunity-zones/refresh` - Force refresh of opportunity zone data

### OAuth 2.1 Endpoints
- `POST /api/oauth/register` - Register a new OAuth client
- `GET /oauth/authorize` - OAuth authorization endpoint
- `POST /api/oauth/token` - Token exchange endpoint
- `GET /.well-known/oauth-authorization-server` - OAuth discovery metadata

## 🔗 MCP Client Integration

### [Claude Desktop](https://www.anthropic.com/products/claude-desktop) and [Claude.ai](https://claude.ai)

Claude supports only the SSE transport. Use the "Connect Apps" button and select "Add Integration":

```
https://YOUR_DOMAIN/mcp/sse
```

Note: Claude Desktop and Web will not accept `localhost` URLs.

### [Cursor](https://cursor.com/)

Edit your `mcp.json`:

```json
{
  "mcpServers": {
    "oz-mcp": {
      "name": "Opportunity Zone MCP Server",
      "url": "https://YOUR_DOMAIN/mcp/mcp",
      "transport": "http-stream"
    }
  }
}
```

### [VSCode](https://code.visualstudio.com/)

Add to your `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "Opportunity Zone Server": {
        "url": "https://YOUR_DOMAIN/mcp/mcp"
      }
    }
  }
}
```

### [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)

Connect to `https://YOUR_DOMAIN/mcp/mcp` with Streamable HTTP transport, or `https://YOUR_DOMAIN/mcp/sse` for SSE transport.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Redis instance (for SSE transport)
- Google OAuth credentials

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Set up database (first time only)
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file (not `.env.local` - Prisma doesn't support it):

```env
# Database (required)
DATABASE_URL="postgresql://user:pass@server/database"

# Authentication (required)
AUTH_SECRET="your-random-secret-string"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Redis (required for SSE transport)
REDIS_URL="rediss://user:pass@host:6379"

# Geocoding (required)
GEOCODING_API_KEY="your-geocode-maps-co-api-key"

# Optional
OZ_DATA_URL="https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson"
NEXTAUTH_URL="https://your-domain.com"
```

## 🎨 Architecture

### Core Components
- **MCP Server**: `/src/app/mcp/[transport]/route.ts` - MCP protocol implementation
- **Services**: 
  - `/src/lib/services/postgis-opportunity-zones.ts` - PostGIS spatial queries
  - `/src/lib/services/geocoding.ts` - Address geocoding with caching
- **Authentication**: `/src/app/auth.ts` - Auth.js Google OAuth configuration
- **Database**: PostgreSQL with Prisma ORM for OAuth, caching, and spatial data

### Performance Optimizations
- **PostGIS Integration**: Optimized spatial queries with 91.9% geometry compression
- **Multi-layer Caching**: Database caching for geocoding and opportunity zone data
- **Bundle Optimization**: Removed unused UI components, code splitting
- **Rate Limiting**: Built-in rate limiting with user feedback

## 🚀 Deployment

### Vercel (Recommended)

This app requires Vercel due to `@vercel/mcp-adapter` dependency for SSE transport support.

1. **Deploy to Vercel**:
   ```bash
   npm install --legacy-peer-deps
   npx prisma generate
   npm run build
   ```

2. **Environment Variables**: Add all required environment variables in Vercel dashboard

3. **Database Setup**: Run migrations on production database:
   ```bash
   npx prisma migrate deploy
   ```

### Build Command
```bash
npm install --legacy-peer-deps && npx prisma generate && npm run build
```

## 📊 Database Schema

The application uses PostgreSQL with these key models:
- **OAuth**: Clients, access tokens, authorization codes with PKCE
- **Caching**: Opportunity zone data (`OpportunityZoneCache`) and geocoding results (`GeocodingCache`)
- **Users**: Session management and accounts via Auth.js

## 🧪 Development Scripts

```bash
# Database operations
npm run seed              # Seed opportunity zones data
npm run seed:check        # Check data without seeding
npm run preprocess        # Preprocess opportunity zones for PostGIS

# Deployment
npm run deploy:setup      # Production deployment setup
```

## 🔒 Security Features

- **OAuth 2.1**: Full implementation with PKCE support
- **State Parameter**: CSRF protection
- **Token Expiration**: 1-hour access token lifetime
- **Secure Headers**: Production security headers
- **Rate Limiting**: API and search rate limiting

## 📝 Legal

- [Terms of Service](/legal/terms-of-service)
- [Privacy Policy](/legal/privacy-policy)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install --legacy-peer-deps`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Replace `YOUR_DOMAIN` with your actual domain name throughout the integration examples.**
