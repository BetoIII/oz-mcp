import { NextRequest, NextResponse } from 'next/server';
import { mcpConnectionManager, getClientIP } from '@/lib/mcp-connection-manager';

/**
 * MCP Monitoring API
 * Provides monitoring data and statistics for MCP endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const connectionStats = mcpConnectionManager.getConnectionStats();
        return NextResponse.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            connections: connectionStats,
            server: {
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              nodeVersion: process.version,
            },
          }
        });

      case 'health':
        const isHealthy = mcpConnectionManager.getActiveConnectionCount() < 10;
        return NextResponse.json({
          success: true,
          data: {
            status: isHealthy ? 'healthy' : 'warning',
            timestamp: new Date().toISOString(),
            checks: {
              connectionLimit: {
                status: isHealthy ? 'pass' : 'warn',
                message: `${mcpConnectionManager.getActiveConnectionCount()}/10 connections`,
              },
              memoryUsage: {
                status: 'pass',
                message: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB heap used`,
              },
            },
          }
        });

      case 'connections':
        const detailedStats = mcpConnectionManager.getConnectionStats();
        return NextResponse.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            summary: {
              active: detailedStats.activeConnections,
              total: detailedStats.totalConnections,
              maxAllowed: detailedStats.maxConnections,
            },
            connections: detailedStats.connectionDetails,
          }
        });

      case 'ratelimits':
        const clientIP = getClientIP(request);
        const rateLimitStats = mcpConnectionManager.getRateLimitStats(clientIP);
        return NextResponse.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            clientIP,
            currentClient: rateLimitStats,
            limits: {
              requestsPerMinute: 30,
              windowSeconds: 60,
            },
          }
        });

      default:
        // Return overview by default
        const overviewStats = mcpConnectionManager.getConnectionStats();
        const clientRateLimit = mcpConnectionManager.getRateLimitStats(getClientIP(request));
        
        return NextResponse.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            overview: {
              status: overviewStats.activeConnections < 8 ? 'healthy' : 'warning',
              activeConnections: overviewStats.activeConnections,
              maxConnections: overviewStats.maxConnections,
              utilizationPercent: Math.round((overviewStats.activeConnections / overviewStats.maxConnections) * 100),
            },
            connections: overviewStats,
            rateLimit: clientRateLimit,
            server: {
              uptime: Math.round(process.uptime()),
              memory: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              },
            },
          }
        });
    }

  } catch (error) {
    console.error('[MCP Monitor] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Control MCP connections (admin operations)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, connectionId, force } = body;

    // Basic authorization check (implement proper auth as needed)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authorization required',
      }, { status: 401 });
    }

    switch (action) {
      case 'closeConnection':
        if (!connectionId) {
          return NextResponse.json({
            success: false,
            error: 'connectionId required',
          }, { status: 400 });
        }

        mcpConnectionManager.closeConnection(connectionId);
        return NextResponse.json({
          success: true,
          message: `Connection ${connectionId} closed`,
          timestamp: new Date().toISOString(),
        });

      case 'getMetrics':
        const metrics = {
          timestamp: new Date().toISOString(),
          connections: mcpConnectionManager.getConnectionStats(),
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
          },
        };

        return NextResponse.json({
          success: true,
          data: metrics,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[MCP Monitor] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}