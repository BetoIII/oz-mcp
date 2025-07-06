# Build Optimization Strategy

## Problem
The application was experiencing "Out of Memory" (OOM) errors during Vercel builds when trying to seed the cache database with 8,764 opportunity zone features. This happened because:

1. The seeding process runs during the build phase (`prebuild` script)
2. Downloading and processing large geospatial datasets consumes significant memory
3. Vercel's build containers have limited memory (8GB)
4. The build process was killed with SIGKILL when memory was exhausted

## Solution

### 1. Skip Seeding During Build
The `scripts/deploy-setup.js` script now detects build environments and skips seeding:

```javascript
// Skip seeding during build phase to prevent OOM errors
const isVercelBuild = process.env.VERCEL === '1' && !process.env.VERCEL_ENV;
const isBuildPhase = process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV === undefined;
const explicitSkip = process.env.SKIP_SEEDING === 'true';

const skipSeeding = explicitSkip || isVercelBuild || isBuildPhase;
```

### 2. Runtime Seeding
The `OpportunityZoneService` handles seeding on first request:

1. **Quick Initialize**: Tries to load from cache database immediately
2. **Background Seeding**: If cache is empty, seeds in background without blocking startup
3. **Graceful Fallback**: Service remains available even if seeding fails

### 3. Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SKIP_SEEDING` | Explicitly skip seeding | `true` |
| `VERCEL` | Vercel build indicator | `1` |
| `VERCEL_ENV` | Vercel environment | `production` |
| `NODE_ENV` | Node environment | `production` |

## Build Process

### During Build
1. `postinstall`: Generate Prisma clients ✅
2. `prebuild`: Run deploy-setup (skips seeding) ✅
3. `build`: Generate clients + Next.js build ✅

### After Deployment
1. First request triggers service initialization
2. Cache database is checked for existing data
3. If empty, seeding starts in background
4. Service remains available during seeding

## Manual Seeding

If you need to seed the database manually:

```bash
# Seed opportunity zones
npm run seed

# Check seeding status
npm run seed:check

# Force reseed
npm run seed:force

# Optimize (preprocess + seed)
npm run optimize
```

## Monitoring

The service provides status endpoints:
- Cache status and metrics
- Initialization progress
- Background seeding status

## Benefits

1. **Reliable Builds**: No more OOM errors during build
2. **Fast Startup**: Service starts immediately
3. **Graceful Degradation**: Works even without cached data
4. **Background Processing**: Seeding doesn't block user requests
5. **Fault Tolerance**: Handles network failures and timeouts 