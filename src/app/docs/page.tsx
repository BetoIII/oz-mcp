import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Zap, 
  Brain, 
  Code, 
  Globe,
  CheckCircle, 
  ExternalLink,
  Settings,
  Play,
  Key,
  Terminal
} from 'lucide-react';
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="docs" title="Documentation" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Opportunity Zone MCP Server</h1>
                <p className="text-gray-600 mt-1">
                  Complete documentation for integrating with the Opportunity Zone MCP server
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The Opportunity Zone MCP server provides tools for checking whether coordinates fall within 
                designated Opportunity Zones in the United States. It supports both direct API calls and 
                MCP-compatible AI assistants like Claude.
              </p>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>What you'll learn:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• How to quickly get started with the MCP server</li>
                    <li>• Setting up Claude to use the server</li>
                    <li>• OpenAI function calling examples</li>
                    <li>• Complete REST API specification</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Quick Start</span>
              </CardTitle>
              <CardDescription>
                Get up and running with the Opportunity Zone MCP server in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-700">Step 1</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Get API Access</h3>
                </div>
                <p className="text-gray-600">
                  Register for an API key to access the MCP server endpoints.
                </p>
                
                <Card className="bg-gray-50">
                  <CardContent className="pt-6">
                    <ol className="text-sm text-gray-700 space-y-2">
                      <li>1. Visit the <Link href="/dashboard" className="text-blue-600 hover:underline">developer dashboard</Link></li>
                      <li>2. Create a new OAuth client</li>
                      <li>3. Copy your client credentials</li>
                      <li>4. Follow the <Link href="/docs/oauth-flow" className="text-blue-600 hover:underline">OAuth flow</Link> to get an access token</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">Step 2</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Make Your First Request</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Terminal className="h-4 w-4" />
                      <span>Test the API</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`curl -X POST https://oz-mcp.vercel.app/api/opportunity-zones/check \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "latitude": 38.8977,
    "longitude": -77.0365
  }'`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Claude Setup */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Claude Setup</span>
              </CardTitle>
              <CardDescription>
                Configure Claude to use the Opportunity Zone MCP server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-700">MCP Config</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Add to Claude Configuration</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>claude_desktop_config.json</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "mcpServers": {
    "opportunity-zones": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "env": {
        "FETCH_BASE_URL": "https://oz-mcp.vercel.app/api/mcp",
        "FETCH_API_KEY": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">Usage</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Example Claude Prompt</h3>
                </div>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-blue-800 text-sm">
                      "Check if the coordinates 38.8977, -77.0365 (Washington DC) are in an Opportunity Zone"
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* OpenAI Function Example */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>OpenAI Function Example</span>
              </CardTitle>
              <CardDescription>
                Use the server with OpenAI's function calling feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-700">Function Definition</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Define the Function</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Function Schema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`const functions = [
  {
    name: "check_opportunity_zone",
    description: "Check if coordinates are in an Opportunity Zone",
    parameters: {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude coordinate"
        },
        longitude: {
          type: "number", 
          description: "Longitude coordinate"
        }
      },
      required: ["latitude", "longitude"]
    }
  }
];`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-700">Implementation</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Function Handler</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>JavaScript Example</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`async function handleFunctionCall(name, args) {
  if (name === "check_opportunity_zone") {
    const response = await fetch(
      "https://oz-mcp.vercel.app/api/opportunity-zones/check",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_ACCESS_TOKEN",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: args.latitude,
          longitude: args.longitude
        })
      }
    );
    return await response.json();
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* REST Endpoint Spec */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>REST Endpoint Specification</span>
              </CardTitle>
              <CardDescription>
                Complete API reference for all available endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Check Opportunity Zone */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">POST</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Check Opportunity Zone</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">
                      <code className="text-sm">/api/opportunity-zones/check</code>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Request Body:</h4>
                      <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "latitude": number,
  "longitude": number
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Response:</h4>
                      <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "isOpportunityZone": boolean,
  "tract": string | null,
  "state": string | null
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Geocode Address */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-700">POST</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Geocode Address</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">
                      <code className="text-sm">/api/opportunity-zones/geocode</code>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Request Body:</h4>
                      <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "address": string
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Response:</h4>
                      <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "latitude": number,
  "longitude": number,
  "formattedAddress": string,
  "isOpportunityZone": boolean,
  "tract": string | null,
  "state": string | null
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* MCP Endpoint */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-700">POST</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">MCP Protocol</h3>
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">
                      <code className="text-sm">/api/mcp</code>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Supports full MCP (Model Context Protocol) for AI assistants like Claude.
                    </p>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Available Tools:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <code>check_opportunity_zone</code> - Check coordinates</li>
                        <li>• <code>geocode_address</code> - Convert address to coordinates</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Quick Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Developer Dashboard
                  </Button>
                </Link>
                <Link href="/playground">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    API Playground
                  </Button>
                </Link>
                <Link href="/docs/oauth-flow">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    OAuth Flow
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
} 