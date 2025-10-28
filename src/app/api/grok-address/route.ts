import { NextResponse } from 'next/server'
import { z } from 'zod'
import { grokAddress } from '@/lib/services/grok-address'

export const runtime = 'nodejs'

const requestSchema = z.object({
  screenshot: z.string().optional(),
  html: z.string().optional(),
  url: z.string().optional(),
  metadata: z.any().optional(),
  strictValidation: z.boolean().optional()
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

    const { screenshot, html, url, metadata, strictValidation } = parsed.data

    // Ensure at least one input is provided
    if (!screenshot && !html && !url && !metadata) {
      return NextResponse.json(
        {
          error: 'At least one input is required',
          message: 'Please provide screenshot, html, url, or metadata'
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Fetch HTML if URL provided but no HTML
    let htmlContent = html
    if (url && !html) {
      console.log(`[grok-address] Fetching HTML from URL: ${url}`)
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Opportunity Zone Extension',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        })
        if (response.ok) {
          htmlContent = await response.text()
          console.log('[grok-address] HTML fetched successfully')
        }
      } catch (fetchError) {
        console.warn('[grok-address] Failed to fetch HTML:', fetchError)
      }
    }

    const result = await grokAddress({
      screenshot,
      html: htmlContent,
      url,
      metadata,
      options: {
        strictValidation: strictValidation ?? true,
      }
    })

    return NextResponse.json(
      result,
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

    console.error('[grok-address] Error processing request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message,
        confidence: 0,
        sources: []
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
