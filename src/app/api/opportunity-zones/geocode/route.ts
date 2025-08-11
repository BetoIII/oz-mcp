import { NextResponse } from 'next/server'
import { z } from 'zod'
import { geocodingService } from '@/lib/services/geocoding'

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