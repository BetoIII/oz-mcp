import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { prisma } from '@/app/prisma';
import { NextRequest } from 'next/server';
import { opportunityZoneService } from '@/lib/services/opportunity-zones';
import { geocodingService } from '@/lib/services/geocoding';
import { extractAddressFromUrl } from '@/lib/services/listing-address';
import { mcpConnectionManager, getClientIP, generateConnectionId } from '@/lib/mcp-connection-manager';

// Authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  console.log('[MCP] Auth header present:', !!authHeader);
  
  if (!authHeader) {
    console.log('[MCP] No auth header, returning 401');
    return null;
  }

  const token = authHeader.split(' ')[1];
  console.log('[MCP] Token extracted:', token ? 'present' : 'missing');
  
  if (!token) {
    console.log('[MCP] No token, returning 401');
    return null;
  }

  try {
    console.log('[MCP] Looking up access token in database');
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
    });

    console.log('[MCP] Access token found:', !!accessToken);
    
    if (!accessToken) {
      console.log('[MCP] No access token found, returning 401');
      return null;
    }

    console.log('[MCP] Token expires at:', accessToken.expiresAt);
    console.log('[MCP] Current time:', new Date());
    
    if (accessToken.expiresAt < new Date()) {
      console.log('[MCP] Token expired, returning 401');
      return null;
    }

    console.log('[MCP] Authentication successful');
    return accessToken;
  } catch (e) {
    console.error('[MCP] Error validating token:', e);
    return null;
  }
}

// MCP handler with authentication and connection management
const handler = async (req: Request) => {
  const nextReq = req as any as NextRequest; // for type compatibility
  
  // Extract client information
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const connectionId = generateConnectionId();
  
  console.log(`[MCP] New request from ${clientIP} (${userAgent})`);
  
  // Check connection limits and rate limiting
  const connectionCheck = mcpConnectionManager.canAcceptConnection(clientIP, userAgent);
  if (!connectionCheck.allowed) {
    console.log(`[MCP] Connection rejected: ${connectionCheck.reason}`);
    
    const rateLimitStats = mcpConnectionManager.getRateLimitStats(clientIP);
    return new Response(JSON.stringify({ 
      error: 'Connection rejected',
      reason: connectionCheck.reason,
      rateLimit: rateLimitStats
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimitStats.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitStats.resetTime.getTime() / 1000).toString(),
      },
    });
  }

  // Authenticate the request
  const accessToken = await authenticateRequest(nextReq);
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  console.log('[MCP] Authentication successful');

  // Register the connection
  mcpConnectionManager.registerConnection(connectionId, clientIP, userAgent);

  // Log request body
  const requestBody = await req.clone().json().catch(() => null);
  console.log('[MCP] Request body:', requestBody);

  return createMcpHandler(
    (server) => {
      server.tool(
        "check_opportunity_zone",
        "Check if coordinates or an address is in an opportunity zone",
        {
          address: z.string().optional().describe("Full address to check"),
          latitude: z.number().optional().describe("Latitude (alternative to address)"),
          longitude: z.number().optional().describe("Longitude (alternative to address)"),
        },
        async ({ address, latitude, longitude }) => {
          // Update connection activity
          mcpConnectionManager.updateActivity(connectionId);
          
          // Create a logger that captures messages for the response
          const messages: string[] = [];
          const log = (type: string, message: string) => {
            messages.push(`[${type.toUpperCase()}] ${message}`);
            console.log(`[${type.toUpperCase()}] ${message}`);
          };

          try {
            let coords: { latitude: number; longitude: number };

            if (address) {
              // Geocode the address first
              const geocodeResult = await geocodingService.geocodeAddress(address, log);
              coords = {
                latitude: geocodeResult.latitude,
                longitude: geocodeResult.longitude
              };
            } else if (latitude !== undefined && longitude !== undefined) {
              coords = { latitude, longitude };
            } else {
              throw new Error("Either address or both latitude and longitude must be provided");
            }

            // Check if point is in an opportunity zone
            const result = await opportunityZoneService.checkPoint(coords.latitude, coords.longitude, log);
            
            // Only true if both conditions are met to avoid contradictory messages
            const isInOZ = result.isInZone && result.zoneId;
            
            const responseText = address 
              ? `Address "${address}" (${coords.latitude}, ${coords.longitude}) is ${isInOZ ? 'in' : 'not in'} an opportunity zone.`
              : `Point (${coords.latitude}, ${coords.longitude}) is ${isInOZ ? 'in' : 'not in'} an opportunity zone.`;

            const fullResponse = [
              responseText,
              isInOZ ? `Zone ID: ${result.zoneId}` : '',
              `Data version: ${result.metadata.version}`,
              `Last updated: ${result.metadata.lastUpdated.toISOString()}`,
              `Feature count: ${result.metadata.featureCount}`,
              '',
              ...messages
            ].filter(Boolean).join('\n');

            return {
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

            return {
              content: [
                {
                  type: "text",
                  text: fullResponse,
                },
              ],
            };
          }
        }
      );

      server.tool(
        "geocode_address",
        "Convert an address to coordinates",
        {
          address: z.string().describe("Address to geocode"),
        },
        async ({ address }) => {
          // Update connection activity
          mcpConnectionManager.updateActivity(connectionId);
          
          const messages: string[] = [];
          const log = (type: string, message: string) => {
            messages.push(`[${type.toUpperCase()}] ${message}`);
            console.log(`[${type.toUpperCase()}] ${message}`);
          };

          try {
            const result = await geocodingService.geocodeAddress(address, log);
            
            const responseText = [
              `Address: ${address}`,
              `Coordinates: ${result.latitude}, ${result.longitude}`,
              `Display name: ${result.displayName}`,
              '',
              ...messages
            ].join('\n');

            return {
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
              `Error geocoding address "${address}": ${errorMessage}`,
              '',
              ...messages
            ].join('\n');

            return {
              content: [
                {
                  type: "text",
                  text: fullResponse,
                },
              ],
            };
          }
        }
      );

      server.tool(
        "get_listing_address",
        "Extract a normalized US mailing address from a listing URL",
        {
          url: z.string().describe("Listing URL to analyze"),
        },
        async ({ url }) => {
          // Update connection activity
          mcpConnectionManager.updateActivity(connectionId);
          
          const messages: string[] = [];
          const log = (type: string, message: string) => {
            messages.push(`[${type.toUpperCase()}] ${message}`);
            console.log(`[${type.toUpperCase()}] ${message}`);
          };

          try {
            const address = await extractAddressFromUrl(url);
            const responseText = [
              `Address: ${address}`,
              '',
              ...messages
            ].join('\n');

            return {
              content: [
                {
                  type: "text",
                  text: responseText,
                },
              ],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const status = errorMessage === 'NOT_FOUND' ? 'Address not found' : `Error: ${errorMessage}`;
            const fullResponse = [
              status,
              '',
              ...messages
            ].join('\n');

            return {
              content: [
                {
                  type: "text",
                  text: fullResponse,
                },
              ],
            };
          }
        }
      );

      server.tool(
        "get_oz_status",
        "Get opportunity zone service status and cache information",
        {},
        async () => {
          // Update connection activity
          mcpConnectionManager.updateActivity(connectionId);
          
          try {
            const metrics = await opportunityZoneService.getCacheMetricsWithDbCheck();
            const geocodingStats = await geocodingService.getCacheStats();
            const connectionStats = mcpConnectionManager.getConnectionStats();
            
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
              "=== MCP Connection Status ===",
              `Active connections: ${connectionStats.activeConnections}/${connectionStats.maxConnections}`,
              `Total connections: ${connectionStats.totalConnections}`,
              `Current connection: ${connectionId}`,
            ].join('\n');

            return {
              content: [
                {
                  type: "text",
                  text: responseText,
                },
              ],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
              content: [
                {
                  type: "text",
                  text: `Error getting status: ${errorMessage}`,
                },
              ],
            };
          }
        }
      );
    },
    {
      // Optionally add server capabilities here
    },
    {
      basePath: "/mcp",
      verboseLogs: true,
      redisUrl: process.env.REDIS_URL,
    }
  )(req);
};

export { handler as GET, handler as POST };

// CORS preflight handler
export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
} 
