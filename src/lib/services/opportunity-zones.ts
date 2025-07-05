import RBush from 'rbush'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import { prisma } from '@/app/prisma'

// Type for the log function
type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
};

export interface SpatialIndexMetadata {
  version: string
  lastUpdated: Date
  featureCount: number
  nextRefreshDue: Date
  dataHash?: string
}

export interface RBushItem {
  minX: number
  minY: number
  maxX: number
  maxY: number
  feature: any
  index: number
}

export interface CacheState {
  spatialIndex: RBush<RBushItem>
  metadata: SpatialIndexMetadata
  geoJson: any
}

export class OpportunityZoneService {
  private static instance: OpportunityZoneService
  private cache: CacheState | null = null
  private isInitializing = false
  private initPromise: Promise<void> | null = null
  private refreshInterval: NodeJS.Timeout | null = null
  private readonly REFRESH_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly REFRESH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly LOAD_TIMEOUT = 60000 // 60 seconds max for loading data (Vercel free tier limit)

  private constructor() {
    // Start the refresh check timer
    this.startRefreshChecker()
  }

  static getInstance(): OpportunityZoneService {
    if (!OpportunityZoneService.instance) {
      OpportunityZoneService.instance = new OpportunityZoneService()
    }
    return OpportunityZoneService.instance
  }

  private startRefreshChecker() {
    this.refreshInterval = setInterval(() => {
      if (this.cache && new Date() >= this.cache.metadata.nextRefreshDue) {
        this.refresh().catch(console.error)
      }
    }, this.REFRESH_CHECK_INTERVAL)
  }

  private async loadFromDatabase(log: LogFn = defaultLog): Promise<CacheState | null> {
    try {
      const cached = await prisma.opportunityZoneCache.findFirst({
        orderBy: { createdAt: 'desc' }
      })

      if (!cached) {
        log("info", "No cached data found in database")
        return null
      }

      if (new Date() >= cached.nextRefresh) {
        log("info", "Cached data expired, needs refresh")
        return null
      }

      log("info", "Loading cached data from database")
      
      // Rebuild the spatial index from cached data
      const spatialIndex = new RBush<RBushItem>()
      spatialIndex.load(cached.spatialIndex as unknown as RBushItem[])

      return {
        spatialIndex,
        geoJson: cached.geoJsonData,
        metadata: {
          version: cached.version,
          lastUpdated: cached.lastUpdated,
          featureCount: cached.featureCount,
          nextRefreshDue: cached.nextRefresh,
          dataHash: cached.dataHash
        }
      }
    } catch (error) {
      log("error", `Failed to load from database: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  private async saveToDatabase(cache: CacheState, log: LogFn = defaultLog): Promise<void> {
    try {
      // Convert spatial index to serializable format
      const spatialIndexData = cache.spatialIndex.all()

      // Clear old cache entries (keep only the latest)
      await prisma.opportunityZoneCache.deleteMany()

      // Save new cache
      await prisma.opportunityZoneCache.create({
        data: {
          version: cache.metadata.version,
          lastUpdated: cache.metadata.lastUpdated,
          featureCount: cache.metadata.featureCount,
          nextRefresh: cache.metadata.nextRefreshDue,
          dataHash: cache.metadata.dataHash || "",
          geoJsonData: cache.geoJson,
          spatialIndex: spatialIndexData as any
        }
      })

      log("success", "Cache saved to database")
    } catch (error) {
      log("error", `Failed to save to database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async loadOpportunityZones(log: LogFn = defaultLog): Promise<any> {
    const url = process.env.OZ_DATA_URL || 'https://pub-757ceba6f52a4399beb76c4667a53f08.r2.dev/oz-all.geojson'
    
    log("info", `🔗 Fetching opportunity zones data from: ${url}`)
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.LOAD_TIMEOUT)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data?.features?.length) {
        throw new Error('Invalid GeoJSON format: missing features array')
      }

      return this.optimizeGeoJson(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.LOAD_TIMEOUT/1000} seconds`)
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  private optimizeGeoJson(geoJson: any) {
    return {
      type: 'FeatureCollection',
      features: geoJson.features.map((feature: any) => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          GEOID: feature.properties?.GEOID || feature.properties?.CENSUSTRAC
        }
      }))
    }
  }

  private calculateBBox(geometry: any) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    function processCoordinates(coords: [number, number]) {
      const [lon, lat] = coords
      minX = Math.min(minX, lon)
      minY = Math.min(minY, lat)
      maxX = Math.max(maxX, lon)
      maxY = Math.max(maxY, lat)
    }

    function processGeometry(geom: any) {
      if (geom.type === 'Polygon') {
        geom.coordinates[0].forEach((coord: [number, number]) => processCoordinates(coord))
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((polygon: [number, number][][]) => 
          polygon[0].forEach((coord: [number, number]) => processCoordinates(coord))
        )
      }
    }

    processGeometry(geometry)
    return [minX, minY, maxX, maxY]
  }

  private createSpatialIndex(geoJson: any): RBush<RBushItem> {
    const tree = new RBush<RBushItem>()
    const items = geoJson.features.map((feature: any, index: number) => {
      const bbox = feature.bbox || this.calculateBBox(feature.geometry)
      return {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        feature,
        index
      }
    })
    tree.load(items)
    return tree
  }

  private async calculateDataHash(geoJson: any): Promise<string> {
    const data = JSON.stringify(geoJson)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async refresh(log: LogFn = defaultLog): Promise<void> {
    log("info", "🔄 Refreshing opportunity zone data...")
    
    try {
      // Load fresh data from external source
      const geoJson = await this.loadOpportunityZones(log)
      const dataHash = await this.calculateDataHash(geoJson)
      
      // Check if data has changed
      if (this.cache?.metadata.dataHash === dataHash) {
        log("info", "📦 Data unchanged, updating cache timestamps")
        this.cache.metadata.lastUpdated = new Date()
        this.cache.metadata.nextRefreshDue = new Date(Date.now() + this.REFRESH_INTERVAL)
        
        // Update database with new timestamps
        await this.saveToDatabase(this.cache, log)
        return
      }

      const spatialIndex = this.createSpatialIndex(geoJson)
      
      const newCache: CacheState = {
        spatialIndex,
        geoJson,
        metadata: {
          version: new Date().toISOString(),
          lastUpdated: new Date(),
          featureCount: geoJson.features.length,
          nextRefreshDue: new Date(Date.now() + this.REFRESH_INTERVAL),
          dataHash
        }
      }

      this.cache = newCache
      
      // Save to database
      await this.saveToDatabase(newCache, log)

      log("success", `✅ Refresh complete. Loaded ${geoJson.features.length} features`)
    } catch (error) {
      log("error", `❌ Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  async initialize(log: LogFn = defaultLog): Promise<void> {
    // If already initialized with valid cache, return immediately
    if (this.cache && new Date() < this.cache.metadata.nextRefreshDue) {
      return
    }

    // If initialization is in progress, wait for it
    if (this.isInitializing) {
      return this.initPromise!
    }

    this.isInitializing = true
    
    this.initPromise = (async () => {
      try {
        // Try to load from database first
        const cachedData = await this.loadFromDatabase(log)
        if (cachedData) {
          this.cache = cachedData
          log("success", "✅ Loaded data from database cache")
          return
        }

        // If no valid cache, refresh from external source
        await this.refresh(log)
      } catch (error) {
        log("error", `❌ Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        throw error
      }
    })()
    
    try {
      await this.initPromise
    } finally {
      this.isInitializing = false
    }
  }

  private async tryQuickInitialize(log: LogFn = defaultLog): Promise<boolean> {
    if (this.cache) {
      return true // Already have cache
    }

    if (this.isInitializing) {
      // Don't wait for initialization, return false to use fallback
      log("warning", "⏳ Data still loading, using fallback method")
      return false
    }

    // Start initialization in background but don't wait
    this.initialize(log).catch(error => {
      log("error", `Background initialization failed: ${error.message}`)
    })

    return false
  }

  async checkPoint(lat: number, lon: number, log: LogFn = defaultLog): Promise<{
    isInZone: boolean,
    zoneId?: string,
    metadata: SpatialIndexMetadata
  }> {
    // Try quick initialization (non-blocking)
    const hasCache = await this.tryQuickInitialize(log)
    
    if (hasCache && this.cache) {
      // Use fast spatial index lookup
      const pt = point([lon, lat])
      
      // Search only nearby features
      const searchBBox = {
        minX: lon - 0.1,
        minY: lat - 0.1,
        maxX: lon + 0.1,
        maxY: lat + 0.1
      }
      
      const candidateFeatures = this.cache.spatialIndex.search(searchBBox)
      log("info", `🔍 Checking point against ${candidateFeatures.length} nearby polygons`)
      
      for (const item of candidateFeatures) {
        if (booleanPointInPolygon(pt, item.feature.geometry)) {
          return {
            isInZone: true,
            zoneId: item.feature.properties?.GEOID,
            metadata: this.cache.metadata
          }
        }
      }
      
      return {
        isInZone: false,
        metadata: this.cache.metadata
      }
    }

    // Fallback: Service is still loading
    log("info", "🔄 Opportunity zone data is still loading. Please try again in a few moments.")
    throw new Error("Service is initializing. Please wait a moment and try again.")
  }

  // Public methods to get cache information
  getCacheState(): CacheState | null {
    return this.cache
  }

  getCacheMetrics(): {
    isInitialized: boolean
    lastUpdated?: Date
    nextRefreshDue?: Date
    featureCount?: number
    version?: string
    dataHash?: string
  } {
    return {
      isInitialized: !!this.cache,
      lastUpdated: this.cache?.metadata.lastUpdated,
      nextRefreshDue: this.cache?.metadata.nextRefreshDue,
      featureCount: this.cache?.metadata.featureCount,
      version: this.cache?.metadata.version,
      dataHash: this.cache?.metadata.dataHash
    }
  }

  // Method to force a cache refresh
  async forceRefresh(log: LogFn = defaultLog): Promise<void> {
    await this.refresh(log)
  }

  // Clean up method
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }
}

export const opportunityZoneService = OpportunityZoneService.getInstance() 