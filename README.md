# Opportunity Zone Search MCP Server

This is a Next.js-based MCP (Model Context Protocol) server that provides opportunity zone search functionality with OAuth 2.1 authentication. It features a modern web interface for developers and allows users to check if specific coordinates or addresses are located within designated opportunity zones in the United States.

## ✨ Features

### Core MCP Functionality
- **Opportunity Zone Lookup**: Check if coordinates or addresses are in opportunity zones
- **Address Geocoding**: Convert addresses to coordinates using geocode.maps.co
- **PostGIS Spatial Optimization**: Fast point-in-polygon lookups with spatial indexing
- **Data Caching**: Persistent caching of GeoJSON data and geocoding results in PostgreSQL
- **OAuth 2.1 Authentication**: Secure access control with Google OAuth
- **Multiple Transports**: Support for both SSE and Streamable HTTP transports via [@vercel/mcp-adapter](https://github.com/vercel/mcp-adapter)

### Web Interface & Developer Tools
- **🏠 Landing Page**: Modern homepage with interactive search demo and rate limiting
- **📊 Developer Dashboard**: OAuth client management, API token generation, and usage monitoring
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

For direct HTTP access, the following REST endpoints are available:

- `POST /api/opportunity-zones/geocode` - Geocode an address to coordinates
- `GET /api/opportunity-zones/check?lat={lat}&lon={lon}` - Check if coordinates are in opportunity zone
- `GET /api/opportunity-zones/status` - Get service status and performance metrics
- `GET /api/opportunity-zones/refresh` - Force refresh of opportunity zone data

### OAuth 2.1 Endpoints
- `POST /api/oauth/register` - Register a new OAuth client
- `GET /oauth/authorize` - OAuth authorization endpoint
- `POST /api/oauth/token` - Token exchange endpoint
- `GET /.well-known/oauth-authorization-server` - OAuth discovery metadata

## Using with

### [Claude Desktop](https://www.anthropic.com/products/claude-desktop) and [Claude.ai](https://claude.ai)

Claude currently supports only the older SSE transport, so you need to give it a different URL to all the other clients listed here. 

Use the "Connect Apps" button and select "Add Integration". Provide the URL like `https://example.com/mcp/sse` (the `/sse` at the end is important!). Note that Claude Desktop and Web will not accept a `localhost` URL.

### [Cursor](https://cursor.com/)

Edit your `mcp.json` to look like this:

```
{
  "mcpServers": {
      "MyServer": {
        "name": "LlamaIndex MCP Demo",
        "url": "https://example.com/mcp/mcp",
        "transport": "http-stream"
      },
  }
}
```

### [VSCode](https://code.visualstudio.com/)

VSCode currently [doesn't properly evict the client ID](https://github.com/microsoft/vscode/issues/250960), so client registration fails if you accidentally delete the client (the workaround in that issue will resolve it). Otherwise, it works fine. Add this to your settings.json:

```
"mcp": {
    "servers": {
        "My Server": {
            "url": "https://example.com/mcp/mcp"
        }
    }
}
```

### [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

Tell Inspector to connect to `https://example.com/mcp/mcp`, with Streamable HTTP transport. You can also use the SSE transport by connecting to `https://example.com/mcp/sse` instead.

## 🎨 Frontend Integration

This application features a modern, responsive web interface built with:

- **Next.js 15** with App Router
- **shadcn/ui** component library for consistent design
- **Tailwind CSS** for styling with design tokens
- **Framer Motion** for smooth animations
- **Lucide React** for icons
- **TypeScript** for type safety

### Design System

The application uses a comprehensive design system with:
- **Design Tokens**: CSS custom properties for colors, spacing, and typography
- **Semantic Colors**: Brand, success, warning, info, and destructive color schemes
- **Responsive Design**: Mobile-first approach with breakpoint-aware layouts
- **Dark Mode**: System-aware theme switching with manual override
- **Accessibility**: ARIA labels, focus management, and keyboard navigation

### Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Bundle Optimization**: Removed unused UI components to reduce bundle size
- **PostGIS Integration**: Optimized spatial queries with 91.9% geometry compression
- **Rate Limiting**: Built-in rate limiting with user feedback
- **Caching**: Multi-layer caching for geocoding and opportunity zone data

## 🚀 Running the server

```
npm install
prisma generate
npm run dev
```

The very first time you will also need to run `prisma db push` to create the database tables, including the new opportunity zone and geocoding cache tables.

### Environment variables

Required environment variables should be in `.env`: (not `.env.local` because Prisma doesn't support it)

```
# Database (required for OAuth and caching)
DATABASE_URL="postgresql://user:pass@server/database"

# OAuth Authentication 
AUTH_SECRET="any random string"
GOOGLE_CLIENT_ID="a Google OAuth client ID"
GOOGLE_CLIENT_SECRET="a Google OAuth client secret"

# Redis (required for SSE transport)
REDIS_URL="rediss://user:pass@host:6379"

# Opportunity Zone Service
GEOCODING_API_KEY="your-geocode-maps-co-api-key"
OZ_DATA_URL="https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson"

# Optional: Custom app URL for OAuth redirect
NEXTAUTH_URL="https://your-domain.com"
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL database for OAuth authentication and data caching
- `AUTH_SECRET` - Random secret string for session encryption
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `REDIS_URL` - Redis instance for SSE transport (Claude Desktop/Web support)
- `GEOCODING_API_KEY` - API key for geocode.maps.co geocoding service

**Optional Variables:**
- `OZ_DATA_URL` - URL for opportunity zone GeoJSON data (defaults to public R2 bucket)
- `NEXTAUTH_URL` - Base URL for OAuth redirects (auto-detected in most cases)

## Architecture

Key components of this opportunity zone MCP server:

**MCP Server:**
* `/src/app/mcp/[transport]/route.ts` - MCP server implementation with opportunity zone tools

**Services:**
* `/src/lib/services/opportunity-zones.ts` - Core opportunity zone lookup service with spatial indexing
* `/src/lib/services/geocoding.ts` - Address geocoding service with caching

**API Routes:**
* `/src/app/api/opportunity-zones/*` - REST API endpoints for direct HTTP access
* `/src/app/api/oauth/*` - OAuth client registration and token exchange
* `/src/app/oauth/authorize/page.tsx` - OAuth consent screen

**Authentication:**
* `/src/app/auth.ts` - Auth.js authentication configuration (Google OAuth)

**Database Models:**
The app uses PostgreSQL with Prisma for:
- OAuth authentication (clients, access tokens, auth codes)
- Opportunity zone data caching (`OpportunityZoneCache` model)
- Geocoding result caching (`GeocodingCache` model)
- User sessions and accounts

You can swap PostgreSQL for another Prisma-supported database if needed.

You'll also notice:
* `src/app/auth.ts` - this implements Auth.js authentication to your app itself. It's configured to use Google as a provider, but you can change it to use any other provider supports by Auth.js. This is not required for the MCP server to work, but it's a good idea to have it in place for your own app.
* `src/app/api/auth/[...nextauth]/route.ts` - this plumbs in the Auth.js authentication, and is again not part of the OAuth implementation.

## Deploying to production

This app only works if deployed to Vercel currently, due to its dependence on the `@vercel/mcp-adapter` package, which in turn is required to support the old SSE transport. We didn't feel like implementing a whole extra protocol just for Claude Desktop.

Deploy as usual. You'll need to add `prisma generate` to your build command, and of course you'll need all the same environment variables as in the development environment.
