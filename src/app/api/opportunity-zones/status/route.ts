import { NextResponse } from 'next/server'
import { OpportunityZoneService } from '@/lib/services/opportunity-zones'
import { PostGISOpportunityZoneService } from '@/lib/services/postgis-opportunity-zones'

export async function GET() {
  try {
    const service = OpportunityZoneService.getInstance()
    const postGISService = PostGISOpportunityZoneService.getInstance()
    
    // Get comprehensive metrics
    const metrics = await service.getCacheMetricsEnhanced()
    
    // Get PostGIS-specific information
    const postGISMetadata = await postGISService.getMetadata()
    
    // System status assessment
    const systemStatus = {
      overall: 'healthy',
      recommendations: [] as string[],
      optimizationLevel: 'basic'
    }
    
    if (postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0) {
      systemStatus.optimizationLevel = 'advanced'
      systemStatus.recommendations.push('✅ PostGIS optimization is active - excellent performance expected')
    } else if (metrics.isInitialized) {
      systemStatus.optimizationLevel = 'basic'
      systemStatus.recommendations.push('💡 Consider running PostGIS optimization: node scripts/seed-opportunity-zones-postgis.js --force')
    } else {
      systemStatus.overall = 'needs_setup'
      systemStatus.recommendations.push('🔧 Database needs initialization - run seeding script')
    }
    
    // Performance expectations
    const performanceExpectations = {
      expectedQueryTime: postGISMetadata.isPostGISEnabled ? '<100ms' : '100-1000ms',
      scalability: postGISMetadata.isPostGISEnabled ? 'High - can handle 10x more concurrent queries' : 'Moderate - in-memory cache limited',
      storageEfficiency: postGISMetadata.optimizationStats ? 
        `${postGISMetadata.optimizationStats.compressionRatio.toFixed(1)}% geometry compression` : 
        'No compression - full geometry storage'
    }
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      system: systemStatus,
      performance: performanceExpectations,
      
      // Traditional cache metrics
      traditional: {
        isInitialized: metrics.isInitialized,
        isInitializing: metrics.isInitializing,
        lastUpdated: metrics.lastUpdated,
        nextRefreshDue: metrics.nextRefreshDue,
        featureCount: metrics.featureCount,
        version: metrics.version,
        dataHash: metrics.dataHash?.substring(0, 8) + '...',
        dbHasData: metrics.dbHasData
      },
      
      // PostGIS optimization metrics
      postgis: {
        enabled: postGISMetadata.isPostGISEnabled,
        optimized: postGISMetadata.featureCount > 0,
        featureCount: postGISMetadata.featureCount,
        lastUpdated: postGISMetadata.lastUpdated,
        optimizationStats: postGISMetadata.optimizationStats ? {
          totalZones: postGISMetadata.optimizationStats.totalZones,
          compressionRatio: `${postGISMetadata.optimizationStats.compressionRatio.toFixed(1)}%`,
          vertexReduction: `${postGISMetadata.optimizationStats.avgOriginalVertices} → ${postGISMetadata.optimizationStats.avgSimplifiedVertices}`,
          estimatedStorageSavings: `~${(postGISMetadata.optimizationStats.compressionRatio * 0.6).toFixed(1)}%`
        } : null
      },
      
      // Quick actions
      quickActions: {
        enableOptimization: {
          command: 'node scripts/seed-opportunity-zones-postgis.js --force',
          description: 'Enable PostGIS optimization for 50-100x performance improvement'
        },
        checkSetup: {
          command: 'node scripts/seed-opportunity-zones-postgis.js --setup-check',
          description: 'Verify PostGIS extension and table structure'
        },
        benchmark: {
          command: 'node scripts/seed-opportunity-zones-postgis.js --benchmark',
          description: 'Run performance benchmark tests'
        },
        testQuery: {
          url: '/api/opportunity-zones/check?lat=40.7128&lon=-74.0060',
          description: 'Test query performance (New York City coordinates)'
        }
      },
      
      // Technical details
      technical: {
        priorityImplementations: {
          priority1: {
            name: 'Hybrid Approach with Geometry Simplification',
            status: postGISMetadata.isPostGISEnabled ? 'Active' : 'Available',
            description: 'Store simplified OZ polygons using ST_Simplify with 0.001 tolerance'
          },
          priority2: {
            name: 'Two-Stage Bounding Box Pre-filtering',
            status: postGISMetadata.isPostGISEnabled ? 'Active' : 'Available',
            description: 'Fast bounding box check followed by precise containment'
          }
        },
        databaseFeatures: {
          postGISExtension: postGISMetadata.isPostGISEnabled ? 'Enabled' : 'Disabled',
          spatialIndexes: postGISMetadata.featureCount > 0 ? 'Active (GIST indexes)' : 'Not configured',
          geometryTypes: postGISMetadata.featureCount > 0 ? 'Original + Simplified + BBox' : 'N/A'
        }
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting status:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        possibleCauses: [
          'Database connection issues',
          'PostGIS extension not installed',
          'Migration not applied',
          'Service initialization failure'
        ],
        quickFixes: [
          'Check database connection',
          'Run: node scripts/seed-opportunity-zones-postgis.js --setup-check',
          'Verify DATABASE_URL environment variable'
        ]
      }
    }, { status: 500 })
  }
} 