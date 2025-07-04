import { NextResponse } from 'next/server'
import { opportunityZoneService } from '@/lib/services/opportunity-zones'
import { geocodingService } from '@/lib/services/geocoding'

interface CacheStatus {
  cache: {
    isAvailable: boolean
    lastUpdated?: string
    nextRefreshDue?: string
    featureCount?: number
    version?: string
    dataHash?: string
  }
  externalStorage: {
    url: string
    accessible: boolean
  }
  geocoding: {
    totalCached: number
    expiredEntries: number
  }
  system: {
    timestamp: string
    environment: string
  }
}

export async function GET(request: Request) {
  try {
    // Get memory cache metrics
    const cacheMetrics = opportunityZoneService.getCacheMetrics()
    const geocodingStats = await geocodingService.getCacheStats()
    
    // Test external storage accessibility
    const externalUrl = process.env.OZ_DATA_URL || 'https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson'
    let storageAccessible = false
    try {
      const testResponse = await fetch(externalUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
      storageAccessible = testResponse.ok
    } catch {
      storageAccessible = false
    }

    const status: CacheStatus = {
      cache: {
        isAvailable: cacheMetrics.isInitialized,
        lastUpdated: cacheMetrics.lastUpdated?.toISOString(),
        nextRefreshDue: cacheMetrics.nextRefreshDue?.toISOString(),
        featureCount: cacheMetrics.featureCount,
        version: cacheMetrics.version,
        dataHash: cacheMetrics.dataHash
      },
      externalStorage: {
        url: externalUrl,
        accessible: storageAccessible
      },
      geocoding: {
        totalCached: geocodingStats.totalCached,
        expiredEntries: geocodingStats.expiredEntries
      },
      system: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    }

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error getting cache status:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
} 