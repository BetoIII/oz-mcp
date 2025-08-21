import { NextRequest, NextResponse } from 'next/server'
import { PostGISOpportunityZoneService } from '@/lib/services/postgis-opportunity-zones'
import { ContiguityAnalyzer } from '@/lib/utils/contiguity-analyzer'

const ZONE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FECA57', // Yellow
  '#DDA0DD', // Plum
  '#FF8C69', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#82E0AA'  // Light Green
]

export async function GET(request: NextRequest) {
  const withCors = (res: NextResponse) => {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res
  }

  const searchParams = request.nextUrl.searchParams
  const north = searchParams.get('north')
  const south = searchParams.get('south')
  const east = searchParams.get('east')
  const west = searchParams.get('west')
  const zoom = searchParams.get('zoom')

  // Validate required parameters
  if (!north || !south || !east || !west) {
    return withCors(NextResponse.json(
      { 
        error: 'Missing required parameters: north, south, east, west bounds are required',
        example: '/api/opportunity-zones/shapes?north=34.1&south=34.0&east=-118.0&west=-118.3&zoom=12'
      },
      { status: 400 }
    ))
  }

  const bounds = {
    north: parseFloat(north),
    south: parseFloat(south),
    east: parseFloat(east),
    west: parseFloat(west)
  }

  // Validate bounds
  if (Object.values(bounds).some(isNaN)) {
    return withCors(NextResponse.json(
      { error: 'Invalid bounds: all bounds parameters must be valid numbers' },
      { status: 400 }
    ))
  }

  if (bounds.north <= bounds.south || bounds.east <= bounds.west) {
    return withCors(NextResponse.json(
      { error: 'Invalid bounds: north must be > south and east must be > west' },
      { status: 400 }
    ))
  }

  // Optional zoom parameter with default
  const zoomLevel = zoom ? Math.max(1, Math.min(20, parseInt(zoom))) : 12

  const startTime = Date.now()

  try {
    const service = PostGISOpportunityZoneService.getInstance()
    
    // Fetch opportunity zone shapes within bounds
    const geoJsonData = await service.getShapesInBounds(bounds, zoomLevel)
    
    if (geoJsonData.features.length === 0) {
      return withCors(NextResponse.json({
        ...geoJsonData,
        metadata: {
          bounds,
          zoomLevel,
          shapeCount: 0,
          queryTime: `${Date.now() - startTime}ms`,
          message: 'No opportunity zones found in the specified area'
        }
      }))
    }

    // Add color assignments to features based on contiguity
    const coloredFeatures = ContiguityAnalyzer.assignColors(geoJsonData.features, ZONE_COLORS)
    
    // Get contiguity statistics
    const contiguityStats = ContiguityAnalyzer.getContiguityStats(geoJsonData.features)

    const response = {
      type: 'FeatureCollection',
      features: coloredFeatures,
      metadata: {
        bounds,
        zoomLevel,
        shapeCount: coloredFeatures.length,
        queryTime: `${Date.now() - startTime}ms`,
        colors: ZONE_COLORS,
        contiguity: contiguityStats,
        message: `Found ${coloredFeatures.length} opportunity zones in ${contiguityStats.contiguousGroups} contiguous group(s)`
      }
    }

    return withCors(NextResponse.json(response))
    
  } catch (error) {
    console.error('Error fetching opportunity zone shapes:', error)
    
    return withCors(NextResponse.json(
      {
        error: 'Failed to fetch opportunity zone shapes',
        details: error instanceof Error ? error.message : 'Unknown error',
        bounds,
        queryTime: `${Date.now() - startTime}ms`
      },
      { status: 500 }
    ))
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

