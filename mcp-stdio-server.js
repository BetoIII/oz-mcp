#!/usr/bin/env node

/**
 * MCP STDIO Server for Local MCP Clients
 *
 * This server creates a Model Context Protocol (MCP) interface using STDIO transport,
 * allowing local AI agents (Goose Block, Claude Desktop, Cursor, etc.) to access
 * opportunity zone data through a command-line interface.
 *
 * USAGE:
 * ------
 * Set environment variables before running:
 *   OZ_MCP_API_KEY - Your API key from the dashboard (required)
 *   OZ_API_URL     - API endpoint (optional, defaults to http://localhost:3000/api/mcp)
 *
 * Run directly:
 *   node mcp-stdio-server.js
 *
 * Or configure in your MCP client (e.g., Goose Block):
 *   Command: node /path/to/oz-mcp/mcp-stdio-server.js
 *   Env: OZ_MCP_API_KEY=your-key-here
 *
 * WHAT IT DOES:
 * -------------
 * - Listens for MCP requests via STDIN
 * - Forwards tool calls to the HTTP API with authentication
 * - Returns results via STDOUT in MCP format
 * - Provides 4 tools: check_opportunity_zone, geocode_address, get_listing_address, get_oz_status
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Configuration from environment variables
const API_KEY = process.env.OZ_MCP_API_KEY || '308c1641da4cb880dcdbc947cf5ef023e77c7bda5b3d9046c8e94fcf279bcc43';
const API_URL = process.env.OZ_API_URL || 'http://localhost:3000/api/mcp';

// Validate API key is provided
if (!process.env.OZ_MCP_API_KEY) {
  console.error('[MCP STDIO Server] WARNING: Using default API key. Set OZ_MCP_API_KEY environment variable.');
}

console.error('[MCP STDIO Server] Starting...');
console.error(`[MCP STDIO Server] API URL: ${API_URL}`);
console.error(`[MCP STDIO Server] API Key: ${API_KEY.substring(0, 10)}...`);

// Create MCP server
const server = new Server(
  {
    name: 'opportunity-zones',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[MCP STDIO Server] Listing tools');

  return {
    tools: [
      {
        name: 'check_opportunity_zone',
        description: 'Check if coordinates or an address is in an opportunity zone',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Full address to check',
            },
            latitude: {
              type: 'number',
              description: 'Latitude (alternative to address)',
            },
            longitude: {
              type: 'number',
              description: 'Longitude (alternative to address)',
            },
          },
        },
      },
      {
        name: 'geocode_address',
        description: 'Convert an address to coordinates',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to geocode',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'get_listing_address',
        description: 'Extract address from real estate listing URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Real estate listing URL (Zillow, Realtor.com, etc.)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'get_oz_status',
        description: 'Get service status and metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[MCP STDIO Server] Tool call: ${request.params.name}`);
  console.error(`[MCP STDIO Server] Arguments:`, request.params.arguments);

  try {
    // Use dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: request.params.name,
          arguments: request.params.arguments,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MCP STDIO Server] HTTP error: ${response.status} ${errorText}`);

      return {
        content: [
          {
            type: 'text',
            text: `Error: HTTP ${response.status}: ${errorText}`,
          },
        ],
      };
    }

    const data = await response.json();
    console.error(`[MCP STDIO Server] Response:`, JSON.stringify(data).substring(0, 200));

    // Extract result from JSON-RPC response
    if (data.result && data.result.content) {
      // Return the content array directly
      return {
        content: data.result.content,
      };
    } else if (data.error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${data.error.message || JSON.stringify(data.error)}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data),
          },
        ],
      };
    }
  } catch (error) {
    console.error(`[MCP STDIO Server] Error:`, error);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server with STDIO transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP STDIO Server] Connected and ready');
}

main().catch((error) => {
  console.error('[MCP STDIO Server] Fatal error:', error);
  process.exit(1);
});
