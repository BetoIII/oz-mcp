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

### MCP Integration
- **Main MCP Endpoint**: `src/app/api/mcp/route.ts` - Implements JSON-RPC protocol
- **Transport**: Supports both Server-Sent Events (SSE) and HTTP streaming via Vercel MCP adapter
- **Available Tools**:
  - `check_opportunity_zone`: Check coordinates or addresses for OZ status (includes Google Maps link)
  - `geocode_address`: Convert addresses to coordinates
  - `get_oz_status`: Get service status and metrics

### Authentication & Authorization
- **OAuth 2.1**: Full implementation with PKCE support in `src/app/api/oauth/`
- **NextAuth**: Session management in `src/app/auth.ts`
- **Rate Limiting**: Monthly usage limits (5 free searches, higher for authenticated users)
- **API Keys**: Both temporary (3 uses) and persistent keys supported

## Common Development Commands

```bash
# Development
npm run dev                    # Start development server

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
- **Services**: Business logic in `src/lib/services/`
- **API Routes**: REST and MCP endpoints in `src/app/api/`
- **Database**: Prisma schema and migrations in `prisma/`
- **Scripts**: Data processing utilities in `scripts/`

## Testing & Quality

The application uses Next.js built-in linting. Always run `npm run lint` before committing changes.

For spatial query testing, use the playground at `/playground` or the MCP status endpoint to verify PostGIS functionality.

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