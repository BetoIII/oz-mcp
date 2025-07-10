import { prisma } from '@/app/prisma'
import { Prisma } from '@/generated/prisma'

// Type for the log function
type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
};

export interface PostGISOptimizationStats {
  totalZones: number
  avgOriginalVertices: number
  avgSimplifiedVertices: number
  compressionRatio: number
}

export interface PostGISMetadata {
  isPostGISEnabled: boolean
  lastUpdated: Date
  featureCount: number
  optimizationStats?: PostGISOptimizationStats
}

export class PostGISOpportunityZoneService {
  private static instance: PostGISOpportunityZoneService
  private isPostGISEnabled: boolean | null = null
  private simplificationTolerance = 0.001 // Configurable tolerance for geometry simplification

  private constructor() {}

  static getInstance(): PostGISOpportunityZoneService {
    if (!PostGISOpportunityZoneService.instance) {
      PostGISOpportunityZoneService.instance = new PostGISOpportunityZoneService()
    }
    return PostGISOpportunityZoneService.instance
  }

  /**
   * Check if PostGIS is enabled and available
   */
  async checkPostGISAvailability(log: LogFn = defaultLog): Promise<boolean> {
    if (this.isPostGISEnabled !== null) {
      return this.isPostGISEnabled
    }

    try {
      // Check if PostGIS extension is available
      const result = await prisma.$queryRaw<{ available: boolean }[]>`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'postgis'
        ) as available
      `
      
      this.isPostGISEnabled = result[0]?.available || false
      
      if (this.isPostGISEnabled) {
        log("success", "✅ PostGIS extension is available")
      } else {
        log("warning", "⚠️  PostGIS extension not found - run migration to enable")
      }
      
      return this.isPostGISEnabled
    } catch (error) {
      log("error", `❌ Failed to check PostGIS availability: ${error instanceof Error ? error.message : 'Unknown error'}`)
      this.isPostGISEnabled = false
      return false
    }
  }

  /**
   * Priority 2: Two-stage bounding box filtering with PostGIS
   */
  async checkPointFast(lat: number, lon: number, log: LogFn = defaultLog): Promise<{
    isInZone: boolean,
    zoneId?: string,
    method: 'postgis' | 'fallback'
  }> {
    const isPostGISAvailable = await this.checkPostGISAvailability(log)
    
    if (!isPostGISAvailable) {
      return {
        isInZone: false,
        method: 'fallback'
      }
    }

    try {
      log("info", `🔍 Checking coordinates (${lat}, ${lon}) against PostGIS opportunity zones`);
      
      // Use the optimized PostGIS function for two-stage filtering
      const result = await prisma.$queryRaw<{ geoid: string }[]>`
        SELECT * FROM check_point_in_opportunity_zone_fast(${lat}, ${lon})
      `

      const isInZone = result.length > 0 && !!result[0]?.geoid
      
      if (isInZone) {
        log("success", `🎯 Point (${lat}, ${lon}) found in opportunity zone: ${result[0].geoid}`);
        log("success", `✅ RESULT: YES - In Opportunity Zone`);
      } else {
        log("success", `🎯 Point (${lat}, ${lon}) is not in any opportunity zone`);
        log("success", `❌ RESULT: NO - Not in Opportunity Zone`);
      }

      return {
        isInZone,
        zoneId: result[0]?.geoid,
        method: 'postgis'
      }
    } catch (error) {
      log("error", `❌ PostGIS query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        isInZone: false,
        method: 'fallback'
      }
    }
  }

  /**
   * Priority 1: Store simplified geometries from GeoJSON data
   */
  async storeOptimizedGeometries(geoJsonData: any, log: LogFn = defaultLog): Promise<void> {
    const isPostGISAvailable = await this.checkPostGISAvailability(log)
    
    if (!isPostGISAvailable) {
      log("error", "❌ PostGIS not available - cannot store optimized geometries")
      return
    }

    if (!geoJsonData?.features?.length) {
      log("error", "❌ No features found in GeoJSON data")
      return
    }

    log("info", `🔄 Processing ${geoJsonData.features.length} features for PostGIS optimization...`)

    try {
      // Clear existing data
      await prisma.$executeRaw`DELETE FROM "OpportunityZone"`
      
      // Process features in batches to avoid memory issues
      const batchSize = 100
      const features = geoJsonData.features
      
      for (let i = 0; i < features.length; i += batchSize) {
        const batch = features.slice(i, i + batchSize)
        
        log("info", `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(features.length / batchSize)} (${batch.length} features)`)
        
        const batchPromises = batch.map(async (feature: any) => {
          const geoid = feature.properties?.GEOID || feature.properties?.CENSUSTRAC
          
          if (!geoid) {
            log("warning", `⚠️  Skipping feature without GEOID`)
            return
          }

          // Convert GeoJSON to PostGIS format and create simplified versions
          const geoJsonString = JSON.stringify(feature.geometry)
          
          try {
            await prisma.$executeRaw`
              INSERT INTO "OpportunityZone" (id, geoid, "originalGeom", "simplifiedGeom", bbox, "updatedAt")
              VALUES (
                gen_random_uuid(),
                ${geoid},
                ST_SetSRID(ST_GeomFromGeoJSON(${geoJsonString}), 4326),
                ST_SimplifyPreserveTopology(ST_SetSRID(ST_GeomFromGeoJSON(${geoJsonString}), 4326), ${this.simplificationTolerance}),
                ST_Envelope(ST_SetSRID(ST_GeomFromGeoJSON(${geoJsonString}), 4326)),
                NOW()
              )
              ON CONFLICT (geoid) DO UPDATE SET
                "originalGeom" = EXCLUDED."originalGeom",
                "simplifiedGeom" = EXCLUDED."simplifiedGeom",
                bbox = EXCLUDED.bbox,
                "updatedAt" = NOW()
            `
          } catch (error) {
            log("error", `❌ Failed to process feature ${geoid}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        })
        
        await Promise.all(batchPromises)
        
        // Log progress
        const processed = Math.min(i + batchSize, features.length)
        log("info", `✅ Processed ${processed}/${features.length} features (${Math.round(processed / features.length * 100)}%)`)
      }
      
      // Get optimization statistics
      const stats = await this.getOptimizationStats(log)
      
      log("success", `🎉 Successfully stored ${features.length} optimized geometries`)
      if (stats) {
        log("info", `📊 Optimization stats: ${stats.compressionRatio.toFixed(1)}% vertex reduction (${stats.avgOriginalVertices} → ${stats.avgSimplifiedVertices} avg vertices)`)
      }
      
    } catch (error) {
      log("error", `❌ Failed to store optimized geometries: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  /**
   * Get optimization statistics
   */
  async getOptimizationStats(log: LogFn = defaultLog): Promise<PostGISOptimizationStats | null> {
    const isPostGISAvailable = await this.checkPostGISAvailability(log)
    
    if (!isPostGISAvailable) {
      return null
    }

    try {
      const result = await prisma.$queryRaw<{
        total_zones: number,
        avg_original_vertices: number,
        avg_simplified_vertices: number,
        compression_ratio: number
      }[]>`
        SELECT * FROM get_postgis_optimization_stats()
      `

      if (result.length === 0) {
        return null
      }

      const stats = result[0]
      return {
        totalZones: stats.total_zones,
        avgOriginalVertices: stats.avg_original_vertices,
        avgSimplifiedVertices: stats.avg_simplified_vertices,
        compressionRatio: stats.compression_ratio
      }
    } catch (error) {
      log("error", `❌ Failed to get optimization stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * Get metadata about the PostGIS optimization
   */
  async getMetadata(log: LogFn = defaultLog): Promise<PostGISMetadata> {
    const isPostGISAvailable = await this.checkPostGISAvailability(log)
    
    if (!isPostGISAvailable) {
      return {
        isPostGISEnabled: false,
        lastUpdated: new Date(),
        featureCount: 0
      }
    }

    try {
      const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "OpportunityZone"
      `
      const stats = await this.getOptimizationStats(log)
      
      return {
        isPostGISEnabled: true,
        lastUpdated: new Date(),
        featureCount: Number(countResult[0]?.count || 0),
        optimizationStats: stats || undefined
      }
    } catch (error) {
      log("error", `❌ Failed to get metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        isPostGISEnabled: false,
        lastUpdated: new Date(),
        featureCount: 0
      }
    }
  }

  /**
   * Benchmark query performance
   */
  async benchmarkPerformance(testPoints: { lat: number, lon: number }[], log: LogFn = defaultLog): Promise<{
    avgQueryTime: number,
    totalQueries: number,
    successRate: number
  }> {
    const isPostGISAvailable = await this.checkPostGISAvailability(log)
    
    if (!isPostGISAvailable) {
      log("error", "❌ PostGIS not available for benchmarking")
      return { avgQueryTime: 0, totalQueries: 0, successRate: 0 }
    }

    log("info", `🔬 Benchmarking PostGIS performance with ${testPoints.length} test points...`)

    const startTime = Date.now()
    let successCount = 0
    
    const results = await Promise.all(
      testPoints.map(async (point) => {
        const queryStart = Date.now()
        try {
          await this.checkPointFast(point.lat, point.lon, () => {})
          successCount++
          return Date.now() - queryStart
        } catch (error) {
          return Date.now() - queryStart
        }
      })
    )

    const totalTime = Date.now() - startTime
    const avgQueryTime = results.reduce((sum, time) => sum + time, 0) / results.length
    const successRate = (successCount / testPoints.length) * 100

    log("success", `📊 Benchmark results: ${avgQueryTime.toFixed(2)}ms avg per query, ${successRate.toFixed(1)}% success rate`)
    
    return {
      avgQueryTime,
      totalQueries: testPoints.length,
      successRate
    }
  }

  /**
   * Set simplification tolerance for geometry optimization
   */
  setSimplificationTolerance(tolerance: number): void {
    this.simplificationTolerance = tolerance
  }

  /**
   * Get current simplification tolerance
   */
  getSimplificationTolerance(): number {
    return this.simplificationTolerance
  }
}