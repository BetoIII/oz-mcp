/**
 * MCP Connection Manager
 * Handles connection limiting, rate limiting, and SSE management for MCP endpoints
 */

interface ConnectionInfo {
  id: string;
  userAgent: string;
  clientIP: string;
  connectedAt: Date;
  lastActivity: Date;
  requestCount: number;
  isActive: boolean;
}

interface RateLimitInfo {
  requests: number[];
  windowStart: number;
}

class MCPConnectionManager {
  private connections = new Map<string, ConnectionInfo>();
  private rateLimits = new Map<string, RateLimitInfo>();
  
  // Configuration - Aggressive limits for serverless environment
  private readonly MAX_CONNECTIONS = 10; // Maximum concurrent connections (reduced for memory management)
  private readonly MAX_REQUESTS_PER_MINUTE = 10; // Rate limit per client (reduced to prevent abuse)
  private readonly CONNECTION_TIMEOUT_MS = 60 * 1000; // 1 minute (aggressive cleanup)
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds (for status only, not used in SSE)
  private readonly MAX_CONNECTION_IDLE_MS = 30 * 1000; // 30 seconds idle timeout (aggressive)
  private readonly CLEANUP_INTERVAL_MS = 10 * 1000; // 10 seconds cleanup interval
  private lastCleanup: number = Date.now();

  // Bot detection patterns
  private readonly BLOCKED_USER_AGENTS = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
    'go-http-client', 'java/', 'okhttp', 'axios', 'node-fetch', 'whatwg-fetch',
    'headless', 'phantom', 'selenium', 'puppeteer', 'playwright'
  ];

  constructor() {
    // Note: We don't use setInterval in serverless environments
    // Instead, cleanup is called on-demand during each connection check
  }

  /**
   * Check if user agent is a bot or automated client
   */
  private isBot(userAgent: string): boolean {
    const ua = userAgent.toLowerCase();
    return this.BLOCKED_USER_AGENTS.some(pattern => ua.includes(pattern));
  }

  /**
   * Check if a new connection should be allowed
   */
  canAcceptConnection(clientIP: string, userAgent: string): { allowed: boolean; reason?: string } {
    // Run aggressive cleanup on every connection check
    const now = Date.now();
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL_MS) {
      this.cleanup();
      this.lastCleanup = now;
    }

    // Block bots and automated clients
    if (this.isBot(userAgent)) {
      console.log(`[MCP] Blocked bot/crawler: ${userAgent}`);
      return { allowed: false, reason: 'Automated clients not supported for SSE endpoints' };
    }

    // Check connection limit
    const activeConnections = Array.from(this.connections.values()).filter(conn => conn.isActive);
    if (activeConnections.length >= this.MAX_CONNECTIONS) {
      console.log(`[MCP] Connection limit reached: ${activeConnections.length}/${this.MAX_CONNECTIONS}`);
      return { allowed: false, reason: 'Maximum connections exceeded' };
    }

    // Check rate limit
    if (!this.checkRateLimit(clientIP)) {
      console.log(`[MCP] Rate limit exceeded for IP: ${clientIP}`);
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    return { allowed: true };
  }

  /**
   * Register a new connection
   */
  registerConnection(connectionId: string, clientIP: string, userAgent: string): void {
    const now = new Date();
    const connectionInfo: ConnectionInfo = {
      id: connectionId,
      userAgent,
      clientIP,
      connectedAt: now,
      lastActivity: now,
      requestCount: 0,
      isActive: true,
    };

    this.connections.set(connectionId, connectionInfo);
    this.recordRequest(clientIP);

    console.log(`[MCP] New connection registered: ${connectionId} from ${clientIP} (${userAgent})`);
    console.log(`[MCP] Active connections: ${this.getActiveConnectionCount()}`);
  }

  /**
   * Update connection activity
   */
  updateActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      connection.requestCount++;
    }
  }

  /**
   * Close a connection
   */
  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isActive = false;
      console.log(`[MCP] Connection closed: ${connectionId}`);
      console.log(`[MCP] Active connections: ${this.getActiveConnectionCount()}`);
    }
  }

  /**
   * Mark connection as potentially dead (no response to heartbeat)
   */
  markConnectionDead(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isActive = false;
      console.log(`[MCP] Connection marked as dead: ${connectionId} (no heartbeat response)`);
      console.log(`[MCP] Active connections: ${this.getActiveConnectionCount()}`);
    }
  }

  /**
   * Force close idle connections
   */
  forceCloseIdleConnections(): number {
    const now = Date.now();
    let closedCount = 0;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (!connection.isActive) continue;

      const timeSinceActivity = now - connection.lastActivity.getTime();
      
      // Force close if idle for more than MAX_CONNECTION_IDLE_MS
      if (timeSinceActivity > this.MAX_CONNECTION_IDLE_MS) {
        connection.isActive = false;
        closedCount++;
        console.log(`[MCP] Force closed idle connection: ${connectionId} (idle for ${Math.round(timeSinceActivity / 1000)}s)`);
      }
    }

    if (closedCount > 0) {
      console.log(`[MCP] Force closed ${closedCount} idle connections. Active: ${this.getActiveConnectionCount()}`);
    }

    return closedCount;
  }

  /**
   * Check rate limit for a client IP
   */
  private checkRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const rateLimitInfo = this.rateLimits.get(clientIP);

    if (!rateLimitInfo) {
      return true; // No previous requests
    }

    // Clean old requests outside the window
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
    const recentRequests = rateLimitInfo.requests.filter(timestamp => timestamp > windowStart);

    return recentRequests.length < this.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(clientIP: string): void {
    const now = Date.now();
    const rateLimitInfo = this.rateLimits.get(clientIP) || { requests: [], windowStart: now };

    // Clean old requests
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
    rateLimitInfo.requests = rateLimitInfo.requests.filter(timestamp => timestamp > windowStart);
    
    // Add current request
    rateLimitInfo.requests.push(now);
    rateLimitInfo.windowStart = windowStart;

    this.rateLimits.set(clientIP, rateLimitInfo);
  }

  /**
   * Get connection stats
   */
  getConnectionStats() {
    const activeConnections = Array.from(this.connections.values()).filter(conn => conn.isActive);
    const totalConnections = this.connections.size;

    return {
      activeConnections: activeConnections.length,
      totalConnections,
      maxConnections: this.MAX_CONNECTIONS,
      connectionDetails: activeConnections.map(conn => ({
        id: conn.id,
        clientIP: conn.clientIP,
        userAgent: conn.userAgent,
        connectedAt: conn.connectedAt,
        lastActivity: conn.lastActivity,
        requestCount: conn.requestCount,
      })),
    };
  }

  /**
   * Get active connection count
   */
  getActiveConnectionCount(): number {
    return Array.from(this.connections.values()).filter(conn => conn.isActive).length;
  }

  /**
   * Generate heartbeat message
   */
  generateHeartbeat(): string {
    return JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      activeConnections: this.getActiveConnectionCount(),
    });
  }

  /**
   * Check if connection should receive heartbeat
   */
  shouldSendHeartbeat(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) {
      return false;
    }

    const timeSinceLastActivity = Date.now() - connection.lastActivity.getTime();
    return timeSinceLastActivity >= this.HEARTBEAT_INTERVAL_MS;
  }

  /**
   * Clean up stale connections and rate limits (AGGRESSIVE for serverless)
   */
  private cleanup(): void {
    const now = new Date();
    let inactiveCount = 0;
    let removedCount = 0;

    // AGGRESSIVE cleanup: immediately remove stale connections
    for (const [connectionId, connection] of this.connections.entries()) {
      const timeSinceActivity = now.getTime() - connection.lastActivity.getTime();

      // Mark inactive after MAX_CONNECTION_IDLE_MS (30 seconds)
      if (connection.isActive && timeSinceActivity > this.MAX_CONNECTION_IDLE_MS) {
        connection.isActive = false;
        inactiveCount++;
        console.log(`[MCP] Connection ${connectionId} marked as inactive (idle ${Math.round(timeSinceActivity / 1000)}s)`);
      }

      // Immediately remove inactive connections (don't keep them in memory)
      if (!connection.isActive) {
        this.connections.delete(connectionId);
        removedCount++;
      }

      // Also remove any connection older than CONNECTION_TIMEOUT_MS regardless of state
      const timeSinceConnection = now.getTime() - connection.connectedAt.getTime();
      if (timeSinceConnection > this.CONNECTION_TIMEOUT_MS) {
        if (this.connections.has(connectionId)) {
          this.connections.delete(connectionId);
          removedCount++;
          console.log(`[MCP] Connection ${connectionId} removed (age ${Math.round(timeSinceConnection / 1000)}s)`);
        }
      }
    }

    if (inactiveCount > 0 || removedCount > 0) {
      console.log(`[MCP] Cleanup: ${inactiveCount} marked inactive, ${removedCount} removed. Active: ${this.getActiveConnectionCount()}, Total in memory: ${this.connections.size}`);
    }

    // Clean up old rate limit records
    const windowStart = Date.now() - this.RATE_LIMIT_WINDOW_MS;
    let rateLimitsCleaned = 0;
    for (const [clientIP, rateLimitInfo] of this.rateLimits.entries()) {
      rateLimitInfo.requests = rateLimitInfo.requests.filter(timestamp => timestamp > windowStart);

      if (rateLimitInfo.requests.length === 0) {
        this.rateLimits.delete(clientIP);
        rateLimitsCleaned++;
      }
    }

    if (rateLimitsCleaned > 0) {
      console.log(`[MCP] Cleaned ${rateLimitsCleaned} rate limit entries. Total in memory: ${this.rateLimits.size}`);
    }

    // Force garbage collection hint (if available)
    if (global.gc) {
      try {
        global.gc();
        console.log('[MCP] Manual garbage collection triggered');
      } catch (e) {
        // GC not available, that's okay
      }
    }
  }

  /**
   * Get rate limit stats for a client
   */
  getRateLimitStats(clientIP: string) {
    const rateLimitInfo = this.rateLimits.get(clientIP);
    if (!rateLimitInfo) {
      return {
        requests: 0,
        remaining: this.MAX_REQUESTS_PER_MINUTE,
        resetTime: new Date(Date.now() + this.RATE_LIMIT_WINDOW_MS),
      };
    }

    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
    const recentRequests = rateLimitInfo.requests.filter(timestamp => timestamp > windowStart);

    return {
      requests: recentRequests.length,
      remaining: Math.max(0, this.MAX_REQUESTS_PER_MINUTE - recentRequests.length),
      resetTime: new Date(now + this.RATE_LIMIT_WINDOW_MS),
    };
  }
}

// Export singleton instance
export const mcpConnectionManager = new MCPConnectionManager();

// Helper function to extract client IP
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const headers = request.headers;
  
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    'unknown'
  );
}

// Helper function to generate connection ID
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}