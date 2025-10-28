import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';
import { opportunityZoneService } from '@/lib/services/opportunity-zones';
import { geocodingService } from '@/lib/services/geocoding';
import { generateGoogleMapsUrl, generateMapEmbedUrl } from '@/lib/utils';
import { grokAddress } from '@/lib/services/grok-address';

// Temporary token usage tracking (in-memory for simplicity)
const tempTokenUsage = new Map<string, number>();

// Helper function to check if user has exceeded monthly limit
function hasUserExceededMonthlyLimit(user: any): boolean {
  // If no usage period started, they're within limits
  if (!user.usagePeriodStart) return false;
  
  // Check if 30 days have passed since usage period start
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // If usage period started more than 30 days ago, reset is needed (will be handled in increment)
  if (user.usagePeriodStart < thirtyDaysAgo) {
    return false; 
  }
  
  // Check current usage against limit
  return user.monthlyUsageCount >= user.monthlyUsageLimit;
}

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
      include: { user: true }, // Include user data for usage checking
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
      if (currentUsage >= 5) {
        return { ...accessToken, usageExceeded: true };
      }
      // Don't increment here - only after successful operations
      return { ...accessToken, usageCount: currentUsage, isTemporary: true, token };
    }

    // Check if this is a regular API key and validate user's monthly usage limit
    if (hasUserExceededMonthlyLimit(accessToken.user)) {
      return { ...accessToken, usageExceeded: true, isRegularKey: true };
    }

    return { ...accessToken, isRegularKey: true };
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

// Helper function to increment user's monthly usage
async function incrementUserUsage(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Reset if period expired or no period started
    if (!user.usagePeriodStart || user.usagePeriodStart < thirtyDaysAgo) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyUsageCount: 1, // Start fresh with this usage
          usagePeriodStart: now,
          lastApiUsedAt: now,
        },
      });
    } else {
      // Increment existing usage
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyUsageCount: { increment: 1 },
          lastApiUsedAt: now,
        },
      });
    }
  } catch (error) {
    console.error('Error incrementing user usage:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const accessToken = await authenticateRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body early so we can allowlist tools that shouldn't be blocked
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

    // Check if token usage is exceeded, but allow certain tools to remain free/unlimited
    if ((accessToken as any).usageExceeded) {
      const freeTools = new Set(['grok_address', 'get_oz_status']);
      if (!freeTools.has(name)) {
        if ((accessToken as any).isTemporary) {
          return NextResponse.json({ 
            error: 'Temporary API key usage limit exceeded',
            message: 'You have used all 5 requests for this temporary API key. To continue: POST /api/temporary-key to get a new temporary key (or click "Create Temporary API Key" in the Playground), or sign up for a free account at /dashboard for higher limits.',
            code: 'TEMP_KEY_LIMIT_EXCEEDED'
          }, { status: 429 });
        } else {
          // Calculate days until reset for user messaging
          const user = (accessToken as any).user;
          const now = new Date();
          const daysUntilReset = user.usagePeriodStart 
            ? Math.ceil((30 * 24 * 60 * 60 * 1000 - (now.getTime() - user.usagePeriodStart.getTime())) / (24 * 60 * 60 * 1000))
            : 0;
          
          return NextResponse.json({ 
            error: 'Monthly usage limit exceeded',
            message: `You have used all ${user.monthlyUsageLimit} searches for this month. Usage will reset in ${Math.max(1, daysUntilReset)} days. To continue now, create a new temporary API key via POST /api/temporary-key or upgrade your plan in the dashboard (/dashboard).`,
            code: 'MONTHLY_LIMIT_EXCEEDED'
          }, { status: 429 });
        }
      }
    }

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
          
          // Only true if both conditions are met to avoid contradictory messages
          const isInOZ = ozResult.isInZone && ozResult.zoneId;
          
          const responseText = address 
            ? `Address "${address}" (${coords.latitude}, ${coords.longitude}) is ${isInOZ ? 'in' : 'not in'} an opportunity zone.`
            : `Point (${coords.latitude}, ${coords.longitude}) is ${isInOZ ? 'in' : 'not in'} an opportunity zone.`;

          // Generate Google Maps URL for the location
          const mapUrl = generateGoogleMapsUrl(coords.latitude, coords.longitude, address);

          // Generate embeddable map URL for MCP UI
          const embedUrl = generateMapEmbedUrl(
            coords.latitude,
            coords.longitude,
            address,
            Boolean(isInOZ),
            ozResult.zoneId || undefined
          );

          const fullResponse = [
            responseText,
            isInOZ ? `Zone ID: ${ozResult.zoneId}` : '',
            `📍 View on Google Maps: ${mapUrl}`,
            '',
            `Data version: ${ozResult.metadata.version}`,
            `Last updated: ${ozResult.metadata.lastUpdated.toISOString()}`,
            `Feature count: ${ozResult.metadata.featureCount}`,
            '',
            ...messages
          ].filter(Boolean).join('\n');

          // Create UI resource for embeddable map using MCP resource format
          // The resource contains the iframe URL in text/uri-list format
          result = {
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
                },
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

      case 'grok_address':
        try {
          const { screenshot, html, url, metadata, strictValidation } = args;

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

          const grokResult = await grokAddress({
            screenshot,
            html: htmlContent,
            url,
            metadata,
            options: {
              strictValidation: strictValidation ?? true,
              geocodeValidation: false
            }
          }, log);

          if (grokResult.success && grokResult.address) {
            const responseText = [
              `✅ Address extracted successfully:`,
              ``,
              `**${grokResult.address}**`,
              ``,
              `Confidence: ${(grokResult.confidence * 100).toFixed(1)}%`,
              `Sources: ${grokResult.sources.join(', ')}`,
              ``,
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
          } else {
            const warningText = grokResult.warnings?.join('\n• ') || 'No address could be extracted';
            const responseText = [
              `❌ Address extraction failed`,
              ``,
              grokResult.address ? `Candidate: ${grokResult.address}` : '',
              `Confidence: ${(grokResult.confidence * 100).toFixed(1)}%`,
              grokResult.address ? `(Threshold: 80%)` : '',
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

            result = {
              content: [
                {
                  type: "text",
                  text: responseText,
                },
              ],
            };
          }
          // This tool is free and does not count toward usage limits
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullResponse = [
            `❌ Error: ${errorMessage}`,
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

    // Only increment token usage if operation was successful and should be counted
    if (shouldIncrementUsage) {
      if ((accessToken as any).isTemporary) {
        incrementTempTokenUsage((accessToken as any).token);
      } else if ((accessToken as any).isRegularKey) {
        await incrementUserUsage(accessToken.userId);
      }
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OZ-Extension',
    },
  });
} 