import { prisma } from '@/app/prisma'

// Custom error to represent upstream geocoder rate limiting
export class GeocodingRateLimitError extends Error {
  public status: number = 429
  public code: string = 'GEOCODER_RATE_LIMITED'
  public retryAfter?: string
  public rateLimitLimit?: string
  public rateLimitRemaining?: string
  public rateLimitReset?: string
  public rawHeaders?: Record<string, string>

  constructor(message: string, headers?: Headers) {
    super(message)
    this.name = 'GeocodingRateLimitError'
    Object.setPrototypeOf(this, GeocodingRateLimitError.prototype)

    if (headers) {
      this.retryAfter = headers.get('Retry-After') ?? undefined
      this.rateLimitLimit = headers.get('X-RateLimit-Limit') ?? headers.get('RateLimit-Limit') ?? undefined
      this.rateLimitRemaining = headers.get('X-RateLimit-Remaining') ?? headers.get('RateLimit-Remaining') ?? undefined
      this.rateLimitReset = headers.get('X-RateLimit-Reset') ?? headers.get('RateLimit-Reset') ?? undefined
      const collected: Record<string, string> = {}
      headers.forEach((value, key) => {
        collected[key] = value
      })
      this.rawHeaders = collected
    }
  }
}

// Type for the log function
type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
};

export interface GeocodingResult {
  latitude: number
  longitude: number
  displayName: string
  notFound?: boolean
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
      const cached = await prisma.geocodingCache.findUnique({
        where: { address: this.normalizeAddress(address) }
      })

      if (!cached) {
        return null
      }

      // Check if cache has expired
      if (new Date() >= cached.expiresAt) {
        // Delete expired cache entry
        await prisma.geocodingCache.delete({
          where: { id: cached.id }
        }).catch(() => {}) // Ignore errors in cleanup
        return null
      }

      const result: GeocodingResult = {
        latitude: cached.latitude,
        longitude: cached.longitude,
        displayName: cached.displayName
      }

      // Include notFound flag if it was a failed lookup
      if (cached.notFound) {
        result.notFound = true
      }

      return result
    } catch (error) {
      // If there's an error accessing cache, continue without it
      return null
    }
  }

  private async cacheResult(address: string, result: GeocodingResult): Promise<void> {
    try {
      const normalizedAddress = this.normalizeAddress(address)
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION)

      await prisma.geocodingCache.upsert({
        where: { address: normalizedAddress },
        update: {
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          notFound: result.notFound || false,
          expiresAt
        },
        create: {
          address: normalizedAddress,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          notFound: result.notFound || false,
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
      log("error", "❌ Geocoding API key not configured");
      throw new Error('Geocoding API key not configured')
    }

    // Use geocode.maps.co as mentioned in the plan
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`
    
    log("info", `🌍 Geocoding address: ${address}`)
    log("info", `🔗 Geocoding request initiated`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Opportunity Zone MCP Server'
        }
      })

      if (!response.ok) {
        // Map upstream rate limit to a structured error so API routes can return HTTP 429
        if (response.status === 429) {
          const message = `Geocoding rate limited: ${response.status} ${response.statusText}`
          log("warning", `⚠️ ${message}`)
          throw new GeocodingRateLimitError(message, response.headers)
        }

        const errorMessage = `❌ Geocoding failed: ${response.status} ${response.statusText}`
        log("error", errorMessage)
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      log("info", `📊 Geocoding returned ${Array.isArray(data) ? data.length : 0} results`);

      if (!Array.isArray(data) || data.length === 0) {
        log("warning", "⚠️ No geocoding results found for address");
        return {
          latitude: 0,
          longitude: 0,
          displayName: address,
          notFound: true
        }
      }

      const result = data[0]
      
      if (!result.lat || !result.lon) {
        log("error", "❌ Missing coordinates in geocoding result");
        throw new Error('Invalid geocoding response: missing coordinates')
      }

      const geocodingResult: GeocodingResult = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name || address
      }

      // Create a sanitized display name like in the opportunity-zone-search repo
      const sanitizedDisplayName = (() => {
        if (!result.display_name) return address;
        const parts = result.display_name.split(',');
        return parts.length > 2 ? parts.slice(0, parts.length - 2).join(',').trim() : result.display_name;
      })();

      log("success", `✅ Geocoded "${address}" to ${geocodingResult.latitude}, ${geocodingResult.longitude}`)
      log("info", `📍 Using coordinates for "${sanitizedDisplayName}"`);
      
      return {
        ...geocodingResult,
        displayName: sanitizedDisplayName
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        log("error", `❌ Geocoding request timed out after ${this.REQUEST_TIMEOUT/1000} seconds`);
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
      const result = await prisma.geocodingCache.deleteMany({
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
        prisma.geocodingCache.count(),
        prisma.geocodingCache.count({
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