import { NextResponse } from 'next/server'
import { z } from 'zod'
import { extractAddressFromUrl } from '@/lib/services/listing-address'

export const runtime = 'nodejs'

const requestSchema = z.object({
  url: z.string().url('Invalid URL')
})

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
    const body = await request.json().catch(() => null)
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: parsed.error.format()
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    const { url } = parsed.data

    const address = await extractAddressFromUrl(url)

    return NextResponse.json(
      { address },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        }
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Address not found' },
        {
          status: 422,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    console.error('Error extracting listing address:', error)
    return NextResponse.json(
      {
        error: 'Server error',
        message
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