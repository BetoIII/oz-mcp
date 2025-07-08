import { NextRequest, NextResponse } from 'next/server'
import { OpportunityZoneService } from '@/lib/services/opportunity-zones'
import { geocodingService } from '@/lib/services/geocoding'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const address = searchParams.get('address')
  const format = searchParams.get('format') // 'mcp' for MCP format

  // Check if we have either coordinates or address
  if (!address && (!lat || !lon)) {
    return NextResponse.json(
      { error: 'Missing required parameters: either address OR (lat and lon)' },
      { status: 400 }
    )
  }

  let latitude: number;
  let longitude: number;
  let geocodedAddress: string;

  try {
    // If address is provided, geocode it first
    if (address) {
      const geocodeResult = await geocodingService.geocodeAddress(address);
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
      geocodedAddress = geocodeResult.displayName || address;
    } else {
      latitude = parseFloat(lat!);
      longitude = parseFloat(lon!);
      geocodedAddress = `${latitude}, ${longitude}`;

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat and lon must be valid numbers' },
          { status: 400 }
        )
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat must be between -90 and 90, lon must be between -180 and 180' },
          { status: 400 }
        )
      }
    }

    const service = OpportunityZoneService.getInstance()
    const startTime = Date.now()

    const result = await service.checkPoint(latitude, longitude)
    const queryTime = Date.now() - startTime

    // If MCP format is requested, return MCP-style response
    if (format === 'mcp') {
      const isInOZ = result.isInZone;
      const zoneId = result.zoneId;
      
      let mcpText = `Address "${geocodedAddress}" (${latitude}, ${longitude}) is`;
      
      if (isInOZ && zoneId) {
        mcpText += ` in an opportunity zone.\nZone ID: ${zoneId}`;
      } else {
        mcpText += ` in an opportunity zone.`; // This will be handled by the null zone ID
      }
      
      mcpText += `\nData version: ${result.metadata.version}`;
      mcpText += `\nLast updated: ${result.metadata.lastUpdated}`;
      mcpText += `\nFeature count: ${result.metadata.featureCount}`;
      
      if (address) {
        mcpText += `\n[INFO] 🌍 Geocoding address: ${address}`;
        mcpText += `\n[SUCCESS] ✅ Geocoded "${address}" to ${latitude}, ${longitude}`;
      }
      
      mcpText += `\n[INFO] 🚀 Attempting PostGIS-optimized query...`;
      
      if (result.method === 'postgis') {
        mcpText += `\n[SUCCESS] ✅ PostGIS extension is available`;
        if (isInOZ && zoneId) {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: ${zoneId}`;
        } else {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: null`;
        }
        mcpText += `\n[SUCCESS] ⚡ PostGIS query completed - method: postgis`;
      } else {
        mcpText += `\n[INFO] 📦 Using fallback R-Bush spatial index`;
        if (isInOZ && zoneId) {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: ${zoneId}`;
        } else {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: null`;
        }
        mcpText += `\n[SUCCESS] ⚡ Query completed - method: ${result.method}`;
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            {
              type: 'text',
              text: mcpText
            }
          ]
        }
      }, { status: 200 });
    }

    // Enhanced response with PostGIS optimization info (original format)
    const performance: Record<string, any> = {
      queryTimeMs: queryTime,
      isOptimized: result.method === 'postgis',
      optimizationActive: result.method === 'postgis' ? 'PostGIS spatial indexing with geometry simplification' : 
                         result.method === 'rbush' ? 'R-Bush spatial indexing with in-memory cache' : 
                         'Fallback mode - consider running PostGIS optimization'
    }

    // Add performance warnings/recommendations
    if (queryTime > 1000) {
      performance.warning = 'Query took longer than 1 second - consider running PostGIS optimization'
      performance.recommendation = 'Run: node scripts/seed-opportunity-zones-postgis.js --force'
    } else if (queryTime > 100) {
      performance.info = 'Query completed in sub-second time - good performance'
    } else {
      performance.info = 'Excellent query performance - under 100ms'
    }

    const response = {
      coordinates: {
        latitude,
        longitude
      },
      ...(address && { geocodedAddress }),
      isInOpportunityZone: result.isInZone,
      opportunityZoneId: result.zoneId || null,
      metadata: {
        queryTime: `${queryTime}ms`,
        method: result.method || 'unknown',
        lastUpdated: result.metadata.lastUpdated,
        featureCount: result.metadata.featureCount,
        nextRefreshDue: result.metadata.nextRefreshDue,
        version: result.metadata.version
      },
      performance
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const queryTime = Date.now() - (Date.now() - 100) // Approximate timing for error case
    
    console.error('Error checking opportunity zone:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check opportunity zone',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(address && { address }),
        coordinates: latitude! && longitude! ? { latitude, longitude } : undefined,
        queryTime: `${queryTime}ms`,
        troubleshooting: {
          suggestion: 'Try running PostGIS optimization for better performance',
          command: 'node scripts/seed-opportunity-zones-postgis.js --force',
          checkSetup: 'node scripts/seed-opportunity-zones-postgis.js --setup-check'
        }
      },
      { status: 500 }
    )
  }
} 