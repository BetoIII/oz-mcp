# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based MCP (Model Context Protocol) server that provides opportunity zone search functionality with OAuth 2.1 authentication. The application allows checking if coordinates or addresses are located within designated U.S. Opportunity Zones using optimized PostGIS spatial queries.

## Key Architecture

### Database & Spatial Operations
- **Database**: PostgreSQL with PostGIS extension for spatial operations
- **Schema**: Managed via Prisma ORM (`prisma/schema.prisma`)
- **Spatial Data**: Optimized opportunity zone geometries with 91.9% compression using `ST_SimplifyPreserveTopology`
- **Performance**: Uses GIST spatial indexes for sub-100ms point-in-polygon queries

### Core Services
- **OpportunityZoneService** (`src/lib/services/opportunity-zones.ts`): Main service coordinating spatial queries
- **PostGISOpportunityZoneService** (`src/lib/services/postgis-opportunity-zones.ts`): PostGIS-optimized spatial operations
- **GeocodingService** (`src/lib/services/geocoding.ts`): Address-to-coordinate conversion with caching
- **ListingAddressService** (`src/lib/services/listing-address.ts`): Real estate listing URL address extraction service

### MCP Integration
- **Main MCP Endpoint**: `src/app/api/mcp/route.ts` - Legacy JSON-RPC implementation (still active)
- **Vercel MCP Adapter**: `src/app/mcp/[transport]/route.ts` - Modern MCP handler with enhanced connection management
- **Transport**: Supports both Server-Sent Events (SSE) and HTTP streaming via Vercel MCP adapter
- **Available Tools**:
  - `check_opportunity_zone`: Check coordinates or addresses for OZ status (includes Google Maps link)
  - `geocode_address`: Convert addresses to coordinates
  - `get_listing_address`: Extract addresses from real estate listing URLs (Zillow, Realtor.com, etc.)
  - `get_oz_status`: Get service status and metrics including MCP connection status

### MCP Connection Management & Monitoring
- **Connection Manager** (`src/lib/mcp-connection-manager.ts`): Advanced connection pooling and rate limiting
- **Connection Limits**: Maximum 10 concurrent connections with automatic cleanup
- **Rate Limiting**: 30 requests per minute per IP with rolling windows
- **Security**: Blocks Chrome extensions and undici clients from SSE endpoints
- **Monitoring Dashboard**: Real-time connection monitoring at `/monitor`
- **CLI Tools**: `scripts/monitor-mcp.sh` for command-line monitoring and alerts
- **Documentation**: Comprehensive monitoring guide in `MCP_MONITORING.md`

### Frontend Features
- **Google Maps Integration**: Interactive map display with opportunity zone visualization
- **Places Autocomplete**: Google Places API integration for address input
- **Map Preview**: Color-coded markers (green for OZ, red for non-OZ) with status overlays
- **Responsive UI**: Mobile-friendly interface using Tailwind CSS and shadcn/ui components

### Authentication & Authorization
- **OAuth 2.1**: Full implementation with PKCE support in `src/app/api/oauth/`
- **NextAuth**: Session management in `src/app/auth.ts`
- **Rate Limiting**: Monthly usage limits (5 free searches, higher for authenticated users)
- **API Keys**: Both temporary (5 uses) and persistent keys supported
- **Usage Tracking**: 30-day rolling windows for usage limit enforcement

## Common Development Commands

```bash
# Development
npm run dev                    # Start development server

# Testing
npm run test                   # Run all tests using tsx test runner
npm run test:oz               # Run Google Maps and MCP tests
npm run test:critical         # Run critical business logic tests
npm run test:all              # Run all test files

# Database Operations
npx prisma migrate deploy      # Apply database migrations
npx prisma generate           # Generate Prisma client
npm run seed                  # Seed opportunity zones data
npm run seed:force            # Force reseed (overwrites existing data)
npm run optimize              # Run preprocessing and seeding

# Build & Deploy
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Run ESLint

# Data Processing
npm run preprocess            # Preprocess GeoJSON data
npm run preprocess:force      # Force preprocessing
npm run deploy:setup          # Setup deployment environment
```

## Database Setup Requirements

The application requires PostgreSQL with PostGIS extension. Critical setup steps:

1. Enable PostGIS extension in your database
2. Run Prisma migrations: `npx prisma migrate deploy`
3. Seed opportunity zones data: `npm run seed`

The seeding process downloads and processes ~28MB of GeoJSON data from the U.S. Treasury, applying geometric optimization for performance.

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string with PostGIS
- `GEOCODING_API_KEY`: API key for geocode.maps.co service
- `NEXTAUTH_SECRET`: Secret for NextAuth session encryption
- `NEXTAUTH_URL`: Base URL for OAuth callbacks

## Code Organization

- **Frontend**: Next.js App Router structure in `src/app/`
- **Components**: Reusable UI components in `src/components/` using shadcn/ui
  - `MapPreview.tsx`: Interactive Google Maps component with OZ markers
  - `PlacesAutocomplete.tsx`: Google Places API integration
- **Services**: Business logic in `src/lib/services/`
  - `listing-address.ts`: Extract addresses from real estate listing URLs
  - `mcp-connection-manager.ts`: MCP connection pooling and rate limiting
- **API Routes**: REST and MCP endpoints in `src/app/api/`
- **MCP Endpoints**: Both legacy (`src/app/api/mcp/`) and modern (`src/app/mcp/[transport]/`)
- **Database**: Prisma schema and migrations in `prisma/`
- **Scripts**: Data processing utilities and monitoring tools in `scripts/`
- **Monitoring**: Real-time dashboards and CLI tools
- **Types**: Google Maps and custom TypeScript definitions in `src/types/`

## Testing & Quality

### Test Framework
- **Node.js Test Runner**: Native test runner with tsx for TypeScript support
- **Test Coverage**: Focus on API routes, services, and critical business logic
- **Real Integration**: Tests use actual database connections for realistic testing

### Test Structure
- **Unit Tests**: Services (`src/lib/services/`) and utilities (`src/lib/utils.ts`)
- **API Route Tests**: All endpoints under `src/app/api/`
- **Integration Tests**: Full request/response cycles with mocked dependencies

### Running Tests
```bash
npm run test           # Run all tests using tsx test runner
npm run test:critical  # Run critical business logic tests only  
npm run test:oz        # Run Google Maps and MCP integration tests
npm run test:all       # Run all test files (same as npm run test)
```

### Test Categories Implemented
**Critical Business Logic Tests:**
- Monthly usage limit validation with 30-day rolling windows (`tests/business-logic.monthly-limits.test.ts`)
- PostGIS spatial query services (`tests/services.postgis.test.ts`)
- Authentication utilities and database health checks (`tests/auth-utils.test.ts`)
- Cookie-based rate limiting with 7-day lockouts (`tests/rate-limiting.cookie-tracker.test.ts`)
- Monthly usage reset logic with boundary handling (`tests/usage-reset.monthly-logic.test.ts`)

**Integration Tests:**
- Google Maps URL generation (`tests/utils.maps-url.test.ts`)
- MCP endpoint Google Maps link inclusion (`tests/api.mcp.maps-link.e2e.test.ts`)
- Geocoding service caching (`tests/geocoding.test.ts`)
- Listing address extraction (`tests/listingAddressService.test.ts`)

Always run `npm run test` before committing changes. For spatial query testing, use the playground at `/playground` or the MCP status endpoint to verify PostGIS functionality.

## Deployment Notes

- **Primary Target**: Vercel (optimized configuration in `vercel.json`)
- **Database**: Requires PostGIS-enabled PostgreSQL (Neon, Supabase, etc.)
- **Build Step**: Runs `prisma generate` automatically via `postinstall` script
- **Static Assets**: Opportunity zone data is processed server-side, not included in build

## Performance Considerations

- PostGIS spatial indexes are critical - verify GIST indexes exist on geometry columns
- Geocoding results are cached to reduce external API calls
- Connection pooling is handled by Prisma
- Rate limiting prevents API abuse

## MCP Client Configuration

For Claude Desktop integration:
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

## Monitoring & Operations

### MCP Connection Monitoring
- **Dashboard**: Real-time monitoring at `/monitor`
- **CLI Tool**: `scripts/monitor-mcp.sh` for command-line monitoring
- **API Endpoints**: 
  - `/api/mcp-monitor` - Connection statistics and health
  - `/api/mcp-heartbeat` - SSE heartbeat stream
- **Documentation**: Complete monitoring guide in `MCP_MONITORING.md`

### Connection Management Features
- **Connection Limits**: Max 10 concurrent connections
- **Rate Limiting**: 30 requests/minute per IP
- **Security**: Blocks Chrome extensions and undici clients from SSE
- **Automatic Cleanup**: Stale connection removal with heartbeat monitoring
- **Real-time Stats**: Active connections, rate limits, and health metrics

### Key Monitoring Commands
```bash
# Start continuous monitoring
./scripts/monitor-mcp.sh monitor

# Check health once
./scripts/monitor-mcp.sh health

# View connection stats
curl https://your-domain.com/api/mcp-monitor
```