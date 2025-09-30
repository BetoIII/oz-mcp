import { NextRequest, NextResponse } from 'next/server'
import { PostGISOpportunityZoneService } from '@/lib/services/postgis-opportunity-zones'
import { ContiguityAnalyzer } from '@/lib/utils/contiguity-analyzer'
import { prisma } from '@/app/prisma'

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

// Authentication helper (shared with other endpoints)
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!accessToken) {
      return null;
    }

    if (accessToken.expiresAt < new Date()) {
      return null;
    }

    return accessToken;
  } catch (e) {
    console.error('Error validating token:', e);
    return null;
  }
}

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

export async function POST(request: NextRequest) {
  const withCors = (res: NextResponse) => {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-OZ-Extension')
    return res
  }

  const startTime = Date.now()

  try {
    // Check for required headers
    const authHeader = request.headers.get('authorization')
    const extensionHeader = request.headers.get('x-oz-extension')

    if (!authHeader) {
      return withCors(NextResponse.json(
        {
          error: 'Missing Authorization header',
          message: 'Bearer token is required for shape requests'
        },
        { status: 401 }
      ))
    }

    if (!extensionHeader) {
      return withCors(NextResponse.json(
        {
          error: 'Missing X-OZ-Extension header',
          message: 'Extension version header is required'
        },
        { status: 400 }
      ))
    }

    // Authenticate the request
    const accessToken = await authenticateRequest(request)
    if (!accessToken) {
      return withCors(NextResponse.json(
        {
          error: 'Invalid or expired token',
          message: 'Please provide a valid API token'
        },
        { status: 401 }
      ))
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return withCors(NextResponse.json(
        {
          error: 'Invalid JSON body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      ))
    }

    // Validate zone_ids parameter
    const { zone_ids } = body
    if (!zone_ids) {
      return withCors(NextResponse.json(
        {
          error: 'Missing zone_ids parameter',
          message: 'Request body must include zone_ids array',
          example: { zone_ids: ['06037980100', '06037980200'] }
        },
        { status: 400 }
      ))
    }

    if (!Array.isArray(zone_ids)) {
      return withCors(NextResponse.json(
        {
          error: 'Invalid zone_ids parameter',
          message: 'zone_ids must be an array of strings',
          example: { zone_ids: ['06037980100', '06037980200'] }
        },
        { status: 400 }
      ))
    }

    if (zone_ids.length === 0) {
      return withCors(NextResponse.json(
        {
          error: 'Empty zone_ids array',
          message: 'zone_ids array cannot be empty'
        },
        { status: 400 }
      ))
    }

    if (zone_ids.length > 50) {
      return withCors(NextResponse.json(
        {
          error: 'Too many zone_ids',
          message: 'Maximum 50 zone IDs allowed per request',
          provided: zone_ids.length,
          maximum: 50
        },
        { status: 400 }
      ))
    }

    // Validate zone_ids format
    const invalidZoneIds = zone_ids.filter((id: any) => typeof id !== 'string' || id.trim().length === 0)
    if (invalidZoneIds.length > 0) {
      return withCors(NextResponse.json(
        {
          error: 'Invalid zone_ids format',
          message: 'All zone_ids must be non-empty strings',
          invalidIds: invalidZoneIds
        },
        { status: 400 }
      ))
    }

    const service = PostGISOpportunityZoneService.getInstance()

    // Fetch opportunity zone shapes by zone IDs
    const geoJsonData = await service.getShapesByZoneIds(zone_ids)

    // Add color assignments to features based on contiguity
    const coloredFeatures = ContiguityAnalyzer.assignColors(geoJsonData.features, ZONE_COLORS)

    // Get contiguity statistics
    const contiguityStats = ContiguityAnalyzer.getContiguityStats(geoJsonData.features)

    const queryTime = Date.now() - startTime

    const response = {
      type: 'FeatureCollection',
      features: coloredFeatures,
      metadata: {
        requestedZones: zone_ids.length,
        foundZones: coloredFeatures.length,
        extensionVersion: extensionHeader,
        queryTime: `${queryTime}ms`,
        colors: ZONE_COLORS,
        contiguity: contiguityStats,
        message: coloredFeatures.length === 0
          ? 'No opportunity zones found for the provided IDs'
          : `Found ${coloredFeatures.length}/${zone_ids.length} opportunity zones in ${contiguityStats.contiguousGroups} contiguous group(s)`
      }
    }

    return withCors(NextResponse.json(response))

  } catch (error) {
    console.error('Error fetching opportunity zone shapes by IDs:', error)

    const queryTime = Date.now() - startTime
    return withCors(NextResponse.json(
      {
        error: 'Failed to fetch opportunity zone shapes',
        details: error instanceof Error ? error.message : 'Unknown error',
        queryTime: `${queryTime}ms`
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OZ-Extension',
    }
  })
}

