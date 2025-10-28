import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { prisma } from '@/app/prisma';
import { NextRequest } from 'next/server';
import { opportunityZoneService } from '@/lib/services/opportunity-zones';
import { geocodingService } from '@/lib/services/geocoding';
import { grokAddress } from '@/lib/services/grok-address';
import { mcpConnectionManager, getClientIP, generateConnectionId } from '@/lib/mcp-connection-manager';
import { generateGoogleMapsUrl, generateMapEmbedUrl } from '@/lib/utils';

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
  
  // Block Chrome extension access to prevent unwanted SSE connections
  // Allow undici for MCP clients (like Claude Desktop)
  if (userAgent.toLowerCase().includes('chrome') && userAgent.includes('extension')) {
    console.log(`[MCP] Extension blocked from MCP endpoint - User Agent: ${userAgent}`);
    return new Response(JSON.stringify({ 
      error: 'Extensions are not supported',
      message: 'Please use the regular API endpoints at /api/opportunity-zones/check instead',
      redirect: '/api/opportunity-zones/check',
      userAgent: userAgent
    }), {
      status: 403,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
  
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
    console.log('[MCP] Authentication failed - returning 401');
    return new Response(JSON.stringify({ 
      error: 'Unauthorized',
      message: 'Invalid or expired access token. Please check your Bearer token.',
      hint: 'Get a new token from /dashboard or create a temporary key at POST /api/temporary-key'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  console.log('[MCP] Authentication successful, clientId:', accessToken.clientId);

  // Register the connection
  mcpConnectionManager.registerConnection(connectionId, clientIP, userAgent);

  // Log request body
  const requestBody = await req.clone().json().catch(() => null);
  console.log('[MCP] Request body:', requestBody);

  // Set up abort signal listener for immediate cleanup on disconnect
  const originalResponse = req as any;
  if (originalResponse.signal) {
    originalResponse.signal.addEventListener('abort', () => {
      mcpConnectionManager.closeConnection(connectionId);
      console.log(`[MCP] Connection ${connectionId} aborted by client`);
    });
  }

  // Create handler with optional Redis (SSE works without it, but Redis enables multi-instance sync)
  const mcpHandler = createMcpHandler(
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

            // Create simple text response - map visual will show the details
            const responseText = address
              ? `The address ${address} (coordinates ${coords.latitude}, ${coords.longitude}) is ${isInOZ ? 'located within Opportunity Zone census tract ' + result.zoneId : 'not in an Opportunity Zone'}.`
              : `The coordinates (${coords.latitude}, ${coords.longitude}) ${isInOZ ? 'are located within Opportunity Zone census tract ' + result.zoneId : 'are not in an Opportunity Zone'}.`;

            // Generate Google Maps URL for the location (for reference, but not displayed in text)
            const mapUrl = generateGoogleMapsUrl(coords.latitude, coords.longitude, address);

            // Generate embeddable map URL for MCP UI
            const embedUrl = generateMapEmbedUrl(
              coords.latitude,
              coords.longitude,
              address,
              Boolean(isInOZ),
              result.zoneId || undefined
            );

            // Simple response text - visual map will show location details
            const fullResponse = responseText;

            // Create UI resource for embeddable map using MCP resource format
            // The resource contains the iframe URL in text/uri-list format
            // Use MCP-UI metadata to control iframe dimensions (array format for Goose compatibility)
            return {
              content: [
                {
                  type: "text",
                  text: fullResponse,
                },
                {
                  type: "resource",
                  resource: {
                    uri: `ui://opportunity-zone-map/${coords.latitude}/${coords.longitude}`,
                    mimeType: "text/uri-list",
                    text: embedUrl,
                    _meta: {
                      "preferred-frame-size": ["800px", "360px"]
                    }
                  },
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
        "grok_address",
        "Extract a U.S. mailing address from multimodal inputs (screenshot, HTML, URL, or structured metadata) using AI-powered agent workflow",
        {
          screenshot: z.string().optional().describe("Base64-encoded screenshot (PNG, JPEG, WEBP) of a real estate listing or page with address"),
          html: z.string().optional().describe("HTML content from the page containing the address"),
          url: z.string().optional().describe("URL of the page to analyze (will be fetched if HTML not provided)"),
          metadata: z.any().optional().describe("Structured metadata (JSON-LD, schema.org, etc.) containing address information"),
          strictValidation: z.boolean().optional().describe("Require high confidence (≥80%) for address extraction. Default: true"),
        },
        async ({ screenshot, html, url, metadata, strictValidation }) => {
          // Update connection activity
          mcpConnectionManager.updateActivity(connectionId);

          const messages: string[] = [];
          const log = (type: string, message: string) => {
            messages.push(`[${type.toUpperCase()}] ${message}`);
            console.log(`[${type.toUpperCase()}] ${message}`);
          };

          try {
            // Fetch HTML if URL provided but no HTML
            let htmlContent = html;
            if (url && !html) {
              log('info', `Fetching HTML from URL: ${url}`);
              try {
                const response = await fetch(url, {
                  headers: {
                    'User-Agent': 'Opportunity Zone MCP Server',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                  }
                });
                if (response.ok) {
                  htmlContent = await response.text();
                  log('success', 'HTML fetched successfully');
                }
              } catch (fetchError) {
                log('warning', `Failed to fetch HTML: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
              }
            }

            const result = await grokAddress({
              screenshot,
              html: htmlContent,
              url,
              metadata,
              options: {
                strictValidation: strictValidation ?? true,
                geocodeValidation: false
              }
            }, log);

            if (result.success && result.address) {
              const responseText = [
                `✅ Address extracted successfully:`,
                ``,
                `**${result.address}**`,
                ``,
                `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
                `Sources: ${result.sources.join(', ')}`,
                ``,
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
            } else {
              const warningText = result.warnings?.join('\n• ') || 'No address could be extracted';
              const responseText = [
                `❌ Address extraction failed`,
                ``,
                result.address ? `Candidate: ${result.address}` : '',
                `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
                result.address ? `(Threshold: 80%)` : '',
                ``,
                `Reasons:`,
                `• ${warningText}`,
                ``,
                `Suggestions:`,
                `• Provide multiple input types (screenshot + HTML) for better accuracy`,
                `• Ensure the image/content clearly shows a U.S. street address`,
                `• Check that the address includes: street number, name, city, state, ZIP`,
                ``,
                ...messages
              ].filter(Boolean).join('\n');

              return {
                content: [
                  {
                    type: "text",
                    text: responseText,
                  },
                ],
              };
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const fullResponse = [
              `❌ Error: ${errorMessage}`,
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
      // Redis is optional - SSE will work without it
      ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    }
  );
  
  // Call the MCP handler and wrap the response to ensure cleanup
  try {
    const response = await mcpHandler(req);
    
    // Add cleanup on response close for SSE streams
    if (response.body) {
      const originalBody = response.body;
      const transformStream = new TransformStream({
        start() {
          console.log(`[MCP] Stream started for connection ${connectionId}`);
        },
        transform(chunk, controller) {
          controller.enqueue(chunk);
        },
        flush() {
          console.log(`[MCP] Stream ended/cancelled for connection ${connectionId}`);
          mcpConnectionManager.closeConnection(connectionId);
        }
      });

      return new Response(originalBody.pipeThrough(transformStream), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    
    // For non-streaming responses, clean up immediately
    mcpConnectionManager.closeConnection(connectionId);
    return response;
  } catch (error) {
    console.error(`[MCP] Error handling request for connection ${connectionId}:`, error);
    mcpConnectionManager.closeConnection(connectionId);
    throw error;
  }
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
