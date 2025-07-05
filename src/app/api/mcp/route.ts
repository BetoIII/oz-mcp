import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';
import { opportunityZoneService } from '@/lib/services/opportunity-zones';
import { geocodingService } from '@/lib/services/geocoding';

// Authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return null;
  }

  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
    });

    if (!accessToken) {
      return null;
    }

    if (accessToken.expiresAt < new Date()) {
      return null;
    }

    return accessToken;
  } catch (e) {
    console.error('Error validating token:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const accessToken = await authenticateRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate JSON-RPC format
    if (!body.jsonrpc || !body.method || !body.params) {
      return NextResponse.json({ 
        error: 'Invalid JSON-RPC request format' 
      }, { status: 400 });
    }

    const { method, params, id } = body;

    if (method !== 'tools/call') {
      return NextResponse.json({ 
        error: 'Only tools/call method is supported' 
      }, { status: 400 });
    }

    const { name, arguments: args } = params;

    // Create a logger that captures messages for the response
    const messages: string[] = [];
    const log = (type: string, message: string) => {
      messages.push(`[${type.toUpperCase()}] ${message}`);
      console.log(`[${type.toUpperCase()}] ${message}`);
    };

    let result;

    switch (name) {
      case 'check_opportunity_zone':
        try {
          const { address, latitude, longitude } = args;
          let coords: { latitude: number; longitude: number };

          if (address) {
            // Geocode the address first
            const geocodeResult = await geocodingService.geocodeAddress(address, log);
            coords = {
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude
            };
          } else if (latitude !== undefined && longitude !== undefined) {
            coords = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
          } else {
            throw new Error("Either address or both latitude and longitude must be provided");
          }

          // Check if point is in an opportunity zone
          const ozResult = await opportunityZoneService.checkPoint(coords.latitude, coords.longitude, log);
          
          const responseText = address 
            ? `Address "${address}" (${coords.latitude}, ${coords.longitude}) is ${ozResult.isInZone ? 'in' : 'not in'} an opportunity zone.`
            : `Point (${coords.latitude}, ${coords.longitude}) is ${ozResult.isInZone ? 'in' : 'not in'} an opportunity zone.`;

          const fullResponse = [
            responseText,
            ozResult.isInZone && ozResult.zoneId ? `Zone ID: ${ozResult.zoneId}` : '',
            `Data version: ${ozResult.metadata.version}`,
            `Last updated: ${ozResult.metadata.lastUpdated.toISOString()}`,
            `Feature count: ${ozResult.metadata.featureCount}`,
            '',
            ...messages
          ].filter(Boolean).join('\n');

          result = {
            content: [
              {
                type: "text",
                text: fullResponse,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullResponse = [
            `Error: ${errorMessage}`,
            '',
            ...messages
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: fullResponse,
              },
            ],
          };
        }
        break;

      case 'geocode_address':
        try {
          const { address } = args;
          const geocodeResult = await geocodingService.geocodeAddress(address, log);
          
          const responseText = [
            `Address: ${address}`,
            `Coordinates: ${geocodeResult.latitude}, ${geocodeResult.longitude}`,
            `Display name: ${geocodeResult.displayName}`,
            '',
            ...messages
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullResponse = [
            `Error geocoding address "${args.address}": ${errorMessage}`,
            '',
            ...messages
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: fullResponse,
              },
            ],
          };
        }
        break;

      case 'get_oz_status':
        try {
          const metrics = opportunityZoneService.getCacheMetrics();
          const geocodingStats = await geocodingService.getCacheStats();
          
          const responseText = [
            "=== Opportunity Zone Service Status ===",
            `Initialized: ${metrics.isInitialized ? '✅ Yes' : '❌ No'}`,
            `Last updated: ${metrics.lastUpdated?.toISOString() || 'Never'}`,
            `Next refresh due: ${metrics.nextRefreshDue?.toISOString() || 'Unknown'}`,
            `Feature count: ${metrics.featureCount || 0}`,
            `Data version: ${metrics.version || 'None'}`,
            `Data hash: ${metrics.dataHash || 'None'}`,
            "",
            "=== Geocoding Cache Status ===",
            `Total cached addresses: ${geocodingStats.totalCached}`,
            `Expired entries: ${geocodingStats.expiredEntries}`,
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result = {
            content: [
              {
                type: "text",
                text: `Error getting status: ${errorMessage}`,
              },
            ],
          };
        }
        break;

      case 'refresh_oz_data':
        try {
          await opportunityZoneService.forceRefresh(log);
          const metrics = opportunityZoneService.getCacheMetrics();
          
          const responseText = [
            "✅ Opportunity zone data refreshed successfully!",
            "",
            `Feature count: ${metrics.featureCount}`,
            `Data version: ${metrics.version}`,
            `Last updated: ${metrics.lastUpdated?.toISOString()}`,
            `Next refresh due: ${metrics.nextRefreshDue?.toISOString()}`,
            "",
            ...messages
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullResponse = [
            `❌ Failed to refresh opportunity zone data: ${errorMessage}`,
            '',
            ...messages
          ].join('\n');

          result = {
            content: [
              {
                type: "text",
                text: fullResponse,
              },
            ],
          };
        }
        break;

      default:
        return NextResponse.json({ 
          error: `Unknown tool: ${name}` 
        }, { status: 400 });
    }

    // Return JSON-RPC response
    return NextResponse.json({
      jsonrpc: '2.0',
      id: id,
      result: result
    });

  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// CORS preflight handler
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 