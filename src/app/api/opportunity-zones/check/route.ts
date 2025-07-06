import { NextRequest, NextResponse } from 'next/server'
import { OpportunityZoneService } from '@/lib/services/opportunity-zones'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat and lon' },
      { status: 400 }
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid coordinates: lat and lon must be valid numbers' },
      { status: 400 }
    )
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates: lat must be between -90 and 90, lon must be between -180 and 180' },
      { status: 400 }
    )
  }

  const service = OpportunityZoneService.getInstance()
  const startTime = Date.now()

  try {
    const result = await service.checkPoint(latitude, longitude)
    const queryTime = Date.now() - startTime

    // Enhanced response with PostGIS optimization info
    const performance: Record<string, any> = {
      queryTimeMs: queryTime,
      isOptimized: result.method === 'postgis',
      optimizationActive: result.method === 'postgis' ? 'PostGIS spatial indexing with geometry simplification' : 
                         result.method === 'rbush' ? 'R-Bush spatial indexing with in-memory cache' : 
                         'Fallback mode - consider running PostGIS optimization'
    }

    // Add performance warnings/recommendations
    if (queryTime > 1000) {
      performance.warning = 'Query took longer than 1 second - consider running PostGIS optimization'
      performance.recommendation = 'Run: node scripts/seed-opportunity-zones-postgis.js --force'
    } else if (queryTime > 100) {
      performance.info = 'Query completed in sub-second time - good performance'
    } else {
      performance.info = 'Excellent query performance - under 100ms'
    }

    const response = {
      coordinates: {
        latitude,
        longitude
      },
      isInOpportunityZone: result.isInZone,
      opportunityZoneId: result.zoneId || null,
      metadata: {
        queryTime: `${queryTime}ms`,
        method: result.method || 'unknown',
        lastUpdated: result.metadata.lastUpdated,
        featureCount: result.metadata.featureCount,
        nextRefreshDue: result.metadata.nextRefreshDue,
        version: result.metadata.version
      },
      performance
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const queryTime = Date.now() - startTime
    
    console.error('Error checking opportunity zone:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check opportunity zone',
        details: error instanceof Error ? error.message : 'Unknown error',
        coordinates: { latitude, longitude },
        queryTime: `${queryTime}ms`,
        troubleshooting: {
          suggestion: 'Try running PostGIS optimization for better performance',
          command: 'node scripts/seed-opportunity-zones-postgis.js --force',
          checkSetup: 'node scripts/seed-opportunity-zones-postgis.js --setup-check'
        }
      },
      { status: 500 }
    )
  }
} 