# Dual Database Architecture Migration

## Overview

This document describes the migration from a single database setup to a dual database architecture for optimized performance and separation of concerns.

## Architecture Changes

### Before
- Single Neon PostgreSQL database
- All models (authentication + optimization) in one database
- Potential performance issues with large geospatial data

### After
- **Authentication Database**: Neon PostgreSQL (existing)
  - User authentication and session management
  - OAuth tokens and clients
  - User accounts and profiles
  
- **Cache Database**: Prisma PostgreSQL (new)
  - Opportunity zone cache data
  - Geocoding cache data
  - Optimized for large geospatial datasets

## File Changes

### Database Schema Files
- `prisma/schema.prisma` - Main authentication database schema
- `prisma/schema-cache.prisma` - Cache database schema (NEW)

### Database Client Files
- `src/app/prisma.ts` - Main database client (authentication)
- `src/app/prisma-cache.ts` - Cache database client (NEW)

### Service Updates
- `src/lib/services/opportunity-zones.ts` - Updated to use cache database
- `src/lib/services/geocoding.ts` - Updated to use cache database

### Script Updates
- `scripts/seed-opportunity-zones.js` - Updated to use cache database
- `scripts/deploy-setup.js` - Updated error handling for graceful failures

### Package.json Updates
- Added cache database generation commands
- Updated build process to handle both databases

## Environment Variables

### Required Variables
```bash
# Authentication Database (existing)
DATABASE_URL="postgresql://user:pass@neon-database"

# Cache Database (new)
CACHE_STORAGE_POSTGRES_URL="postgres://685e6cb94c8b8a5f19089c160a4c455ed1f59f0b4a3c8960a8b4baae7c9d1af9:sk_VanNFOe_9mcvfqrKSEq7Y@db.prisma.io:5432/?sslmode=require"
```

## Database Models

### Authentication Database (Neon)
- User
- Account
- Session
- VerificationToken
- Client
- AccessToken
- AuthCode

### Cache Database (Prisma PostgreSQL)
- OpportunityZoneCache
- GeocodingCache

## Initialization Process

### Server Startup
1. **Quick Initialization**: Attempts to load from cache database
2. **Background Seeding**: If cache is empty, automatically seeds in background
3. **Graceful Fallback**: Service starts even if seeding fails
4. **On-Demand Loading**: Downloads data on first request if needed

### Build Process
1. **Prisma Generation**: Generates both database clients
2. **Cache Database Setup**: Creates tables if needed
3. **Seeding Attempt**: Tries to seed cache database
4. **Graceful Continuation**: Build succeeds even if seeding fails

## Benefits

### Performance
- **Faster Startup**: Cache database optimized for large datasets
- **Reduced Load**: Authentication database not impacted by large geospatial queries
- **Spatial Indexing**: Optimized spatial queries on cache database

### Scalability
- **Independent Scaling**: Each database can be scaled independently
- **Specialized Optimization**: Each database optimized for its use case
- **Connection Pooling**: Separate connection pools for different workloads

### Reliability
- **Fault Tolerance**: Authentication works even if cache database is unavailable
- **Graceful Degradation**: Service continues with slower fallback if cache fails
- **Automatic Recovery**: Background processes retry failed operations

## Migration Commands

### Initial Setup
```bash
# Generate both Prisma clients
npm run postinstall

# Create cache database tables
npm run db:push:cache

# Seed cache database
npm run seed
```

### Development
```bash
# Start development server
npm run dev

# Build application
npm run build

# Check cache database health
npm run seed:check
```

### Production Deployment
```bash
# Build process automatically handles seeding
npm run build

# Manual seeding if needed
npm run seed:force
```

## Monitoring

### Service Status
- Cache database connection status
- Data freshness and expiration
- Feature count and last update time
- Background seeding progress

### Health Checks
- `/api/opportunity-zones/status` - Service health
- Cache database connectivity
- Data availability and freshness

## Troubleshooting

### Common Issues
1. **Cache Database Empty**: Run `npm run seed`
2. **Connection Timeout**: Check network and database availability
3. **Large Dataset Issues**: Use regular Postgres connection for seeding
4. **Build Failures**: Seeding failures don't prevent deployment

### Debug Commands
```bash
# Test cache database connection
node scripts/test-cache-db.js

# Check service status
curl /api/opportunity-zones/status

# Force refresh cache
curl /api/opportunity-zones/refresh
```

## Future Enhancements

### Performance Optimizations
- Connection pooling optimization
- Data compression for large datasets
- Incremental cache updates
- CDN integration for static data

### Monitoring & Alerting
- Database performance metrics
- Cache hit rates and efficiency
- Automated failure notifications
- Health check endpoints

### Scaling Considerations
- Database sharding for very large datasets
- Read replicas for cache database
- Geographic distribution of cache data
- Automated failover mechanisms