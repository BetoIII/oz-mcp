import { NextRequest, NextResponse } from 'next/server'
import { geocodingService } from '@/lib/services/geocoding'
import { prisma } from '@/app/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const action = searchParams.get('action') || 'test'

  if (action === 'stats') {
    try {
      const stats = await geocodingService.getCacheStats()
      return NextResponse.json({
        success: true,
        stats
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  if (action === 'list') {
    try {
      const cacheEntries = await prisma.geocodingCache.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
      })
      
      return NextResponse.json({
        success: true,
        entries: cacheEntries.map(entry => ({
          address: entry.address,
          displayName: entry.displayName,
          coordinates: `${entry.latitude}, ${entry.longitude}`,
          notFound: entry.notFound,
          createdAt: entry.createdAt,
          expiresAt: entry.expiresAt
        }))
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  if (action === 'test' && address) {
    try {
      console.log(`\n🧪 Testing geocoding cache for: "${address}"`)
      
      // First request - should hit the API and cache the result
      console.log('🔄 First request (should geocode and cache)...')
      const start1 = Date.now()
      const result1 = await geocodingService.geocodeAddress(address, (type, message) => {
        console.log(`[${type.toUpperCase()}] ${message}`)
      })
      const time1 = Date.now() - start1
      
      // Small delay to ensure cache is written
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Second request - should hit the cache
      console.log('🔄 Second request (should use cache)...')
      const start2 = Date.now()
      const result2 = await geocodingService.geocodeAddress(address, (type, message) => {
        console.log(`[${type.toUpperCase()}] ${message}`)
      })
      const time2 = Date.now() - start2
      
      console.log(`⏱️ First request: ${time1}ms, Second request: ${time2}ms`)
      console.log(`📊 Speed improvement: ${time2 < time1 ? `${((time1 - time2) / time1 * 100).toFixed(1)}% faster` : 'No improvement'}`)
      
      return NextResponse.json({
        success: true,
        address,
        test: {
          firstRequest: {
            time: `${time1}ms`,
            result: result1
          },
          secondRequest: {
            time: `${time2}ms`,
            result: result2,
            usedCache: time2 < time1 && time2 < 50 // Likely used cache if very fast
          },
          cacheWorking: time2 < time1 && time2 < 50,
          speedImprovement: time2 < time1 ? `${((time1 - time2) / time1 * 100).toFixed(1)}%` : '0%'
        }
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  // Help/documentation
  return NextResponse.json({
    success: true,
    documentation: {
      description: 'Geocoding cache test endpoint',
      usage: {
        test: '/api/test-geocoding-cache?action=test&address=YOUR_ADDRESS',
        stats: '/api/test-geocoding-cache?action=stats',
        list: '/api/test-geocoding-cache?action=list'
      },
      examples: {
        test: '/api/test-geocoding-cache?action=test&address=619 E Mandalay Dr, Olmos Park, TX 78212, USA',
        stats: '/api/test-geocoding-cache?action=stats',
        list: '/api/test-geocoding-cache?action=list'
      }
    }
  })
} 