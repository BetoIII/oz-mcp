import { NextResponse } from 'next/server'
import { OpportunityZoneService } from '@/lib/services/opportunity-zones'
import { PostGISOpportunityZoneService } from '@/lib/services/postgis-opportunity-zones'

export async function GET() {
  try {
    const service = OpportunityZoneService.getInstance()
    const postGISService = PostGISOpportunityZoneService.getInstance()
    
    // Get PostGIS-specific information
    const postGISMetadata = await postGISService.getMetadata()
    
    // System status assessment
    const systemStatus = {
      overall: 'healthy',
      recommendations: [] as string[],
      optimizationLevel: 'advanced'
    }
    
    if (postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0) {
      systemStatus.optimizationLevel = 'advanced'
      systemStatus.recommendations.push('✅ PostGIS optimization is active - excellent performance expected')
    } else if (postGISMetadata.isPostGISEnabled) {
      systemStatus.overall = 'needs_setup'
      systemStatus.recommendations.push('🔧 PostGIS enabled but no data found - run seeding script')
      systemStatus.recommendations.push('💡 Run: node scripts/seed-opportunity-zones-postgis.js --force')
    } else {
      systemStatus.overall = 'needs_setup'
      systemStatus.recommendations.push('🔧 PostGIS not enabled - run migration and seeding')
      systemStatus.recommendations.push('💡 First run: npx prisma migrate dev --name enable_postgis')
      systemStatus.recommendations.push('💡 Then run: node scripts/seed-opportunity-zones-postgis.js --force')
    }
    
    // Performance expectations
    const performanceExpectations = {
      expectedQueryTime: postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0 ? '<100ms' : 'Service unavailable',
      scalability: postGISMetadata.isPostGISEnabled ? 'High - optimized for production workloads' : 'Not available',
      storageEfficiency: postGISMetadata.optimizationStats ? 
        `${postGISMetadata.optimizationStats.compressionRatio.toFixed(1)}% geometry compression` : 
        'No optimization available'
    }
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      system: systemStatus,
      performance: performanceExpectations,
      
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
          description: 'Enable PostGIS optimization for optimal performance'
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
        architecture: 'PostGIS-only (simplified)',
        priorityImplementations: {
          priority1: {
            name: 'Hybrid Approach with Geometry Simplification',
            status: postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0 ? 'Active' : 'Not Available',
            description: 'Store simplified OZ polygons using ST_Simplify with 0.001 tolerance'
          },
          priority2: {
            name: 'Two-Stage Bounding Box Pre-filtering',
            status: postGISMetadata.isPostGISEnabled && postGISMetadata.featureCount > 0 ? 'Active' : 'Not Available',
            description: 'Fast bounding box check followed by precise containment'
          }
        },
        databaseFeatures: {
          postGISExtension: postGISMetadata.isPostGISEnabled ? 'Enabled' : 'Disabled',
          spatialIndexes: postGISMetadata.featureCount > 0 ? 'Active (GIST indexes)' : 'Not configured',
          geometryTypes: postGISMetadata.featureCount > 0 ? 'Original + Simplified + BBox' : 'N/A',
          traditionalCache: 'Removed (PostGIS-only architecture)'
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
          'Run: npx prisma migrate dev --name enable_postgis',
          'Run: node scripts/seed-opportunity-zones-postgis.js --setup-check',
          'Run: node scripts/seed-opportunity-zones-postgis.js --force',
          'Verify DATABASE_URL environment variable'
        ]
      }
    }, { status: 500 })
  }
} 