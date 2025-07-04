import { NextResponse } from 'next/server'
import { opportunityZoneService } from '@/lib/services/opportunity-zones'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // For manual refresh, we'll allow it without strict auth
    // In production, you might want to add API key validation here
    
    // Force refresh of opportunity zones data
    await opportunityZoneService.forceRefresh()

    // Get cache metrics after refresh
    const metrics = opportunityZoneService.getCacheMetrics()

    return NextResponse.json({
      success: true,
      refreshed: new Date().toISOString(),
      metrics: {
        featureCount: metrics.featureCount,
        version: metrics.version,
        dataHash: metrics.dataHash,
        lastUpdated: metrics.lastUpdated?.toISOString(),
        nextRefreshDue: metrics.nextRefreshDue?.toISOString()
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('Error refreshing opportunity zones data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
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