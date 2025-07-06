import { prismaCache } from '@/app/prisma-cache'

// Type for the log function
type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
};

export interface GeocodingResult {
  latitude: number
  longitude: number
  displayName: string
}

export class GeocodingService {
  private static instance: GeocodingService
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
  private readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  private constructor() {}

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService()
    }
    return GeocodingService.instance
  }

  private normalizeAddress(address: string): string {
    return address.trim().toLowerCase()
  }

  private async getCachedResult(address: string): Promise<GeocodingResult | null> {
    try {
      const cached = await prismaCache.geocodingCache.findUnique({
        where: { address: this.normalizeAddress(address) }
      })

      if (!cached) {
        return null
      }

      // Check if cache has expired
      if (new Date() >= cached.expiresAt) {
        // Delete expired cache entry
        await prismaCache.geocodingCache.delete({
          where: { id: cached.id }
        }).catch(() => {}) // Ignore errors in cleanup
        return null
      }

      return {
        latitude: cached.latitude,
        longitude: cached.longitude,
        displayName: cached.displayName
      }
    } catch (error) {
      // If there's an error accessing cache, continue without it
      return null
    }
  }

  private async cacheResult(address: string, result: GeocodingResult): Promise<void> {
    try {
      const normalizedAddress = this.normalizeAddress(address)
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION)

      await prismaCache.geocodingCache.upsert({
        where: { address: normalizedAddress },
        update: {
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          expiresAt
        },
        create: {
          address: normalizedAddress,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          expiresAt
        }
      })
    } catch (error) {
      // Cache errors shouldn't fail the geocoding request
      console.error('Failed to cache geocoding result:', error)
    }
  }

  private async geocodeWithAPI(address: string, log: LogFn = defaultLog): Promise<GeocodingResult> {
    const apiKey = process.env.GEOCODING_API_KEY
    if (!apiKey) {
      throw new Error('Geocoding API key not configured')
    }

    log("info", `🌍 Geocoding address: ${address}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Opportunity Zone MCP Server'
        }
      })

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Address not found')
      }

      const result = data[0]
      
      if (!result.lat || !result.lon) {
        throw new Error('Invalid geocoding response: missing coordinates')
      }

      const geocodingResult: GeocodingResult = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name || address
      }

      log("success", `✅ Geocoded "${address}" to ${geocodingResult.latitude}, ${geocodingResult.longitude}`)
      
      return geocodingResult
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Geocoding request timed out after ${this.REQUEST_TIMEOUT/1000} seconds`)
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  async geocodeAddress(address: string, log: LogFn = defaultLog): Promise<GeocodingResult> {
    if (!address || address.trim().length === 0) {
      throw new Error('Address cannot be empty')
    }

    // Try cache first
    const cached = await this.getCachedResult(address)
    if (cached) {
      log("info", `📦 Using cached geocoding result for: ${address}`)
      return cached
    }

    // Geocode using API
    const result = await this.geocodeWithAPI(address, log)
    
    // Cache the result for future use
    await this.cacheResult(address, result)
    
    return result
  }

  async clearExpiredCache(): Promise<number> {
    try {
      const result = await prismaCache.geocodingCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })
      return result.count
    } catch (error) {
      console.error('Failed to clear expired geocoding cache:', error)
      return 0
    }
  }

  async getCacheStats(): Promise<{
    totalCached: number
    expiredEntries: number
  }> {
    try {
      const [total, expired] = await Promise.all([
        prismaCache.geocodingCache.count(),
        prismaCache.geocodingCache.count({
          where: {
            expiresAt: {
              lt: new Date()
            }
          }
        })
      ])

      return { totalCached: total, expiredEntries: expired }
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return { totalCached: 0, expiredEntries: 0 }
    }
  }
}

export const geocodingService = GeocodingService.getInstance() 