import { PostGISOpportunityZoneService } from './postgis-opportunity-zones'

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

export class OpportunityZoneService {
  private static instance: OpportunityZoneService
  private readonly REFRESH_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
  
  // PostGIS integration
  private postGISService: PostGISOpportunityZoneService

  private constructor() {
    this.postGISService = PostGISOpportunityZoneService.getInstance()
  }

  static getInstance(): OpportunityZoneService {
    if (!OpportunityZoneService.instance) {
      OpportunityZoneService.instance = new OpportunityZoneService()
    }
    return OpportunityZoneService.instance
  }

  async checkPoint(lat: number, lon: number, log: LogFn = defaultLog): Promise<{
    isInZone: boolean,
    zoneId?: string,
    metadata: SpatialIndexMetadata,
    method?: 'postgis' | 'rbush' | 'fallback'
  }> {
    // Use PostGIS-optimized query
    try {
      log("info", "🚀 Attempting PostGIS-optimized query...");
      const postGISResult = await this.postGISService.checkPointFast(lat, lon, log)
      
      if (postGISResult.method === 'postgis') {
        log("success", `⚡ PostGIS query completed successfully - method: ${postGISResult.method}`);
        const metadata = await this.postGISService.getMetadata(log)
        
        return {
          isInZone: postGISResult.isInZone,
          zoneId: postGISResult.zoneId,
          metadata: {
            version: metadata.lastUpdated.toISOString(),
            lastUpdated: metadata.lastUpdated,
            featureCount: metadata.featureCount,
            nextRefreshDue: new Date(Date.now() + this.REFRESH_INTERVAL)
          },
          method: 'postgis'
        }
      }
    } catch (error) {
      log("error", `❌ PostGIS query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw new Error("PostGIS service unavailable. Please ensure the database is properly seeded with PostGIS optimization.")
    }

    // If we get here, PostGIS failed
    throw new Error("PostGIS service unavailable. Please ensure the database is properly seeded with PostGIS optimization.")
  }

  // Public methods to get cache information
  getCacheState(): null {
    return null
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
      isInitialized: false
    }
  }

  /**
   * Get comprehensive cache metrics including database check
   */
  async getCacheMetricsWithDbCheck(): Promise<{
    isInitialized: boolean
    isInitializing: boolean
    lastUpdated?: Date
    nextRefreshDue?: Date
    featureCount?: number
    version?: string
    dataHash?: string
    dbHasData?: boolean
  }> {
    try {
      const postGISMetadata = await this.postGISService.getMetadata(() => {})
      
      return {
        isInitialized: postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0,
        isInitializing: false,
        lastUpdated: postGISMetadata.lastUpdated,
        nextRefreshDue: new Date(Date.now() + this.REFRESH_INTERVAL),
        featureCount: postGISMetadata.featureCount,
        version: postGISMetadata.lastUpdated.toISOString(),
        dbHasData: postGISMetadata.featureCount > 0
      }
    } catch (error) {
      return {
        isInitialized: false,
        isInitializing: false,
        dbHasData: false
      }
    }
  }

  async getCacheMetricsEnhanced(): Promise<{
    isInitialized: boolean
    isInitializing: boolean
    lastUpdated?: Date
    nextRefreshDue?: Date
    featureCount?: number
    version?: string
    dataHash?: string
    dbHasData?: boolean
    postGISEnabled?: boolean
    postGISStats?: any
  }> {
    const basicMetrics = await this.getCacheMetricsWithDbCheck()
    
    try {
      const postGISMetadata = await this.postGISService.getMetadata(() => {})
      
      return {
        ...basicMetrics,
        postGISEnabled: postGISMetadata.isPostGISEnabled,
        postGISStats: postGISMetadata.optimizationStats
      }
    } catch (error) {
      return {
        ...basicMetrics,
        postGISEnabled: false
      }
    }
  }

  // Method to force a cache refresh
  async forceRefresh(log: LogFn = defaultLog): Promise<void> {
    log("info", "PostGIS-only service - no cache refresh needed")
  }

  cleanup(): void {
    // No cleanup needed for PostGIS-only service
  }
}

export const opportunityZoneService = OpportunityZoneService.getInstance() 