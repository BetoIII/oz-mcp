import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';
import { opportunityZoneService } from '@/lib/services/opportunity-zones';
import { geocodingService } from '@/lib/services/geocoding';

// Temporary token usage tracking (in-memory for simplicity)
const tempTokenUsage = new Map<string, number>();

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

    // Check if this is a temporary token and validate usage limit
    if (token.startsWith('temp_')) {
      const currentUsage = tempTokenUsage.get(token) || 0;
      if (currentUsage >= 3) {
        return { ...accessToken, usageExceeded: true };
      }
      // Don't increment here - only after successful operations
      return { ...accessToken, usageCount: currentUsage, isTemporary: true, token };
    }

    return accessToken;
  } catch (e) {
    console.error('Error validating token:', e);
    return null;
  }
}

// Helper function to increment temporary token usage
function incrementTempTokenUsage(token: string): void {
  if (token.startsWith('temp_')) {
    const currentUsage = tempTokenUsage.get(token) || 0;
    tempTokenUsage.set(token, currentUsage + 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const accessToken = await authenticateRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if temporary token usage is exceeded
    if ((accessToken as any).usageExceeded) {
      return NextResponse.json({ 
        error: 'Temporary API key usage limit exceeded',
        message: 'You have used all 3 requests for this temporary API key. Please create a new temporary key or signup for a free account.',
        code: 'TEMP_KEY_LIMIT_EXCEEDED'
      }, { status: 429 });
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
    let shouldIncrementUsage = false;

    switch (name) {
      case 'check_opportunity_zone':
        try {
          const { address, latitude, longitude } = args;
          let coords: { latitude: number; longitude: number };

          if (address) {
            // Geocode the address first
            const geocodeResult = await geocodingService.geocodeAddress(address, log);
            
            // If address was not found, don't increment usage and return error
            if (geocodeResult.notFound) {
              const fullResponse = [
                `Error: Address not found: ${address}`,
                'Please check your address format and try again. Make sure to include city and state for U.S. addresses.',
                '',
                'Try formats like:',
                '• 123 Main Street, New York, NY',
                '• 456 Oak Avenue, Los Angeles, CA 90210',
                '• 789 Broadway, Chicago, IL',
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
                addressNotFound: true
              };
              break;
            }
            
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
          
          // Only increment usage if we successfully completed the full check
          shouldIncrementUsage = true;
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
          // Don't increment usage on errors
        }
        break;

      case 'geocode_address':
        try {
          const { address } = args;
          const geocodeResult = await geocodingService.geocodeAddress(address, log);
          
          // If address was not found, don't increment usage
          if (geocodeResult.notFound) {
            const responseText = [
              `Error geocoding address "${address}": Address not found`,
              'Please check your address format and try again.',
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
              addressNotFound: true
            };
            break;
          }
          
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
          
          // Only increment usage if geocoding was successful
          shouldIncrementUsage = true;
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
          // Don't increment usage on errors
        }
        break;

      case 'get_oz_status':
        try {
          const metrics = await opportunityZoneService.getCacheMetricsWithDbCheck();
          const geocodingStats = await geocodingService.getCacheStats();
          
          // Determine actual service readiness
          const isServiceReady = metrics.isInitialized || (metrics.dbHasData && !metrics.isInitializing);
          
          const responseText = [
            "=== Opportunity Zone Service Status ===",
            `Initialized: ${isServiceReady ? '✅ Yes' : '❌ No'}`,
            `Cache loaded: ${metrics.isInitialized ? '✅ Yes' : '❌ No'}`,
            `Database has data: ${metrics.dbHasData ? '✅ Yes' : '❌ No'}`,
            `Initializing: ${metrics.isInitializing ? '⏳ Yes' : '✅ No'}`,
            `Last updated: ${metrics.lastUpdated?.toISOString() || 'Never'}`,
            `Next refresh due: ${metrics.nextRefreshDue?.toISOString() || 'Unknown'}`,
            `Feature count: ${metrics.featureCount || 0}`,
            `Data version: ${metrics.version || 'None'}`,
            `Data hash: ${metrics.dataHash || 'None'}`,
            "",
            "=== Geocoding Cache Status ===",
            `Total cached addresses: ${geocodingStats.totalCached}`,
            `Expired entries: ${geocodingStats.expiredEntries}`,
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
          
          // Status checks don't count towards usage
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullResponse = [
            `Error getting status: ${errorMessage}`,
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

    // Only increment temporary token usage if operation was successful and should be counted
    if (shouldIncrementUsage && (accessToken as any).isTemporary) {
      incrementTempTokenUsage((accessToken as any).token);
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result,
    });

  } catch (error) {
    console.error('Error in MCP route:', error);
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