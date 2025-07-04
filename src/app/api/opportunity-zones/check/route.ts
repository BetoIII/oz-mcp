import { NextResponse } from 'next/server'
import { z } from 'zod'
import { opportunityZoneService } from '@/lib/services/opportunity-zones'
import { geocodingService } from '@/lib/services/geocoding'

export const runtime = 'nodejs'

// Input validation schema
const checkRequestSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional()
}).refine(
  (data) => {
    // Either coordinates or address must be provided
    return (data.latitude !== undefined && data.longitude !== undefined) || data.address !== undefined
  },
  {
    message: "Either both latitude and longitude, or address must be provided"
  }
)

// Response type interface
interface OpportunityZoneCheck {
  lat: number
  lon: number
  timestamp: string
  isInOpportunityZone: boolean
  opportunityZoneId?: string
  metadata: {
    version: string
    lastUpdated: string
    featureCount: number
  }
  address?: string
  displayName?: string
}

// Cache configuration
const CACHE_CONTROL_HEADER = process.env.NODE_ENV === 'production'
  ? 'public, max-age=3600, stale-while-revalidate=86400' // 1 hour fresh, 24 hours stale
  : 'no-store' // No caching in development

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = checkRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: parseResult.error.format()
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    const { latitude, longitude, address } = parseResult.data

    let coords: { latitude: number; longitude: number }
    let geocodeResult: { displayName?: string } = {}

    if (address) {
      // Geocode the address first
      const result = await geocodingService.geocodeAddress(address)
      coords = {
        latitude: result.latitude,
        longitude: result.longitude
      }
      geocodeResult = { displayName: result.displayName }
    } else {
      coords = { latitude: latitude!, longitude: longitude! }
    }

    // Check if point is in an opportunity zone
    const result = await opportunityZoneService.checkPoint(coords.latitude, coords.longitude)

    // Generate ETag based on coordinates and data version
    const etag = `"${coords.latitude},${coords.longitude}-${result.metadata.version}"`
    const ifNoneMatch = request.headers.get('if-none-match')

    // If ETag matches, return 304 Not Modified
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': CACHE_CONTROL_HEADER,
          'ETag': etag,
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    const responseData: OpportunityZoneCheck = {
      lat: coords.latitude,
      lon: coords.longitude,
      timestamp: new Date().toISOString(),
      isInOpportunityZone: result.isInZone,
      opportunityZoneId: result.zoneId,
      metadata: {
        version: result.metadata.version,
        lastUpdated: result.metadata.lastUpdated.toISOString(),
        featureCount: result.metadata.featureCount
      },
      ...(address && { address }),
      ...(geocodeResult.displayName && { displayName: geocodeResult.displayName })
    }

    // Return response with cache headers
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': CACHE_CONTROL_HEADER,
        'ETag': etag,
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
} 