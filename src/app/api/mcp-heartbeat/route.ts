import { NextRequest, NextResponse } from 'next/server';
import { mcpConnectionManager, getClientIP } from '@/lib/mcp-connection-manager';

/**
 * SSE Heartbeat endpoint for MCP connections
 * Provides keep-alive functionality for long-running connections
 */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Check if connection is allowed
  const connectionCheck = mcpConnectionManager.canAcceptConnection(clientIP, userAgent);
  if (!connectionCheck.allowed) {
    return NextResponse.json({ 
      error: 'Connection rejected',
      reason: connectionCheck.reason
    }, { status: 429 });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const connectionId = `heartbeat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Register the heartbeat connection
      mcpConnectionManager.registerConnection(connectionId, clientIP, userAgent);

      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Set up heartbeat interval
      const heartbeatInterval = setInterval(() => {
        try {
          if (mcpConnectionManager.shouldSendHeartbeat(connectionId)) {
            const heartbeat = mcpConnectionManager.generateHeartbeat();
            const message = `data: ${heartbeat}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
            mcpConnectionManager.updateActivity(connectionId);
          }
        } catch (error) {
          console.error('[MCP] Heartbeat error:', error);
          clearInterval(heartbeatInterval);
          mcpConnectionManager.closeConnection(connectionId);
          controller.close();
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Set up connection timeout
      const timeoutInterval = setTimeout(() => {
        console.log(`[MCP] Heartbeat connection ${connectionId} timed out`);
        clearInterval(heartbeatInterval);
        mcpConnectionManager.closeConnection(connectionId);
        controller.close();
      }, 5 * 60 * 1000); // 5 minute timeout

      // Handle connection close
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        clearTimeout(timeoutInterval);
        mcpConnectionManager.closeConnection(connectionId);
        controller.close();
      };

      // Store cleanup function for potential use
      (controller as any)._cleanup = cleanup;
    },

    cancel() {
      // Called when the connection is closed by the client
      if ((this as any)._cleanup) {
        (this as any)._cleanup();
      }
    }
  });

  return new Response(stream, { headers });
}

/**
 * Get connection statistics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'stats') {
      const stats = mcpConnectionManager.getConnectionStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    if (body.action === 'rateLimit') {
      const clientIP = getClientIP(request);
      const rateLimitStats = mcpConnectionManager.getRateLimitStats(clientIP);
      return NextResponse.json({
        success: true,
        data: rateLimitStats
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('[MCP] Heartbeat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
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