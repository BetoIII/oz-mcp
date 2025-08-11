import { NextResponse } from 'next/server'
import { z } from 'zod'
import { geocodingService, GeocodingRateLimitError } from '@/lib/services/geocoding'

export const runtime = 'nodejs'

// Input validation schema
const geocodeRequestSchema = z.object({
  address: z.string().min(1, "Address cannot be empty")
})

// Response type interface
interface GeocodeResponse {
  address: string
  latitude: number
  longitude: number
  displayName: string
  timestamp: string
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OZ-Extension',
    }
  })
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = geocodeRequestSchema.safeParse(body)

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

    const { address } = parseResult.data

    // Geocode the address
    const result = await geocodingService.geocodeAddress(address)

    const responseData: GeocodeResponse = {
      address,
      latitude: result.latitude,
      longitude: result.longitude,
      displayName: result.displayName,
      timestamp: new Date().toISOString()
    }

    // Return response with cache headers (geocoding results are cached internally)
    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1800' // 30 minutes cache
      }
    })

  } catch (error) {
    console.error('Error geocoding address:', error)
    if (error instanceof GeocodingRateLimitError) {
      const res = NextResponse.json(
        {
          error: 'Geocoder rate limited',
          code: error.code,
          message: error.message,
        },
        { status: 429 }
      )
      if (error.retryAfter) res.headers.set('Retry-After', error.retryAfter)
      if (error.rateLimitLimit) {
        res.headers.set('X-RateLimit-Limit', error.rateLimitLimit)
        res.headers.set('RateLimit-Limit', error.rateLimitLimit)
      }
      if (error.rateLimitRemaining) {
        res.headers.set('X-RateLimit-Remaining', error.rateLimitRemaining)
        res.headers.set('RateLimit-Remaining', error.rateLimitRemaining)
      }
      if (error.rateLimitReset) {
        res.headers.set('X-RateLimit-Reset', error.rateLimitReset)
        res.headers.set('RateLimit-Reset', error.rateLimitReset)
      }
      res.headers.set('Access-Control-Expose-Headers', 'Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset')
      res.headers.set('Access-Control-Allow-Origin', '*')
      return res
    }
    return NextResponse.json(
      { 
        error: 'Geocoding failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: error instanceof Error && error.message.includes('not found') ? 404 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
} 