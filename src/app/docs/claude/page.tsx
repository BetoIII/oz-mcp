import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Settings, 
  Terminal, 
  FolderOpen,
  Copy,
  CheckCircle, 
  AlertTriangle,
  Monitor,
  FileText,
  Code,
  Wrench,
  Zap
} from 'lucide-react';
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

export default function ClaudeSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Docs
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Monitor className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Claude Desktop MCP Setup
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Step-by-step guide to add the Opportunity Zone MCP server to Claude Desktop. Get AI-powered geographic intelligence directly in your conversations.
            </p>
            <div className="flex gap-2 justify-center">
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                5 minute setup
              </Badge>
              <Badge variant="outline">macOS & Windows</Badge>
            </div>
          </div>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Prerequisites
              </CardTitle>
              <CardDescription>What you need before starting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Claude Desktop app installed (download from anthropic.com)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Node.js and npm installed (from nodejs.org)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Your Opportunity Zone API key (from the dashboard)</span>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Find Configuration File */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                Step 1: Find Your Configuration File
              </CardTitle>
              <CardDescription>Locate the Claude Desktop configuration directory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">On macOS:</h4>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                    ~/Library/Application Support/Claude/
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘ + Shift + G</kbd> in Finder and paste the path above
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">On Windows:</h4>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                    %APPDATA%\Claude\
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Win + R</kbd>, type the path above, and press Enter
                  </p>
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Screenshot needed:</strong> Take a screenshot showing the Claude application folder with the configuration file visible in your file manager.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 2: Create/Edit Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Step 2: Create or Edit Configuration File
              </CardTitle>
              <CardDescription>Set up claude_desktop_config.json</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-gray-600">Create or open the file <code className="bg-gray-100 px-2 py-1 rounded">claude_desktop_config.json</code> in the directory above.</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">If the file doesn't exist, create it with:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre>{`{
  "mcpServers": {
    "Opportunity Zone MCP": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://oz-mcp.vercel.app/mcp/sse",
        "--header",
        "Authorization: Bearer YOUR_API_KEY_HERE"
      ]
    }
  }
}`}</pre>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="font-semibold text-sm">If the file already exists, add the Opportunity Zone MCP server:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre>{`{
  "mcpServers": {
    "existing-server": {
      // ... your existing servers
    },
    "Opportunity Zone MCP": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://oz-mcp.vercel.app/mcp/sse",
        "--header",
        "Authorization: Bearer YOUR_API_KEY_HERE"
      ]
    }
  }
}`}</pre>
                  </div>
                </div>
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Screenshot needed:</strong> Show the configuration file open in a text editor with the Opportunity Zone MCP server configuration visible.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3: Add API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Step 3: Add Your API Key
              </CardTitle>
              <CardDescription>Replace the placeholder with your actual API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key from the dashboard.</p>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">Example with real API key:</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                    "Authorization: Bearer 0a02da4c5e9cff0f5762387c56f0d5f44e114dc2809c5ed75199f6ee01823f9c"
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security tip:</strong> Keep your API key secure. Don't share screenshots that contain your actual API key.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 4: Restart Claude */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                Step 4: Restart Claude Desktop
              </CardTitle>
              <CardDescription>Apply the new configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">On macOS:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘ + Q</kbd> to quit Claude completely</li>
                      <li>Reopen Claude Desktop from Applications</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">On Windows:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Right-click Claude in the taskbar and select "Close window"</li>
                      <li>Reopen Claude Desktop from the Start menu</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  <strong>Screenshot needed:</strong> Show Claude Desktop application being relaunched, possibly with a loading screen or startup interface.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 5: Test the Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Step 5: Test Your Setup
              </CardTitle>
              <CardDescription>Verify the MCP server is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Try one of these test prompts in Claude:</p>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="font-mono text-sm">"Is the address '123 Main Street, Detroit, MI' in an Opportunity Zone?"</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="font-mono text-sm">"Check if coordinates 42.3314, -83.0458 are in an Opportunity Zone"</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="font-mono text-sm">"What Opportunity Zones are available in San Francisco?"</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">If successful, Claude will:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-green-700">
                    <li>Access the Opportunity Zone MCP server</li>
                    <li>Query geographic data in real-time</li>
                    <li>Provide accurate Opportunity Zone information</li>
                    <li>Show census tract details and zone status</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Screenshot needed:</strong> Show a successful conversation with Claude using the Opportunity Zone MCP server, including both your question and Claude's response with geographic data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                Troubleshooting
              </CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-red-200 pl-4">
                  <h4 className="font-semibold text-red-800 text-sm">Claude doesn't recognize MCP commands</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-red-700 mt-2">
                    <li>Verify the configuration file syntax is valid JSON</li>
                    <li>Check that the file is saved in the correct location</li>
                    <li>Ensure you completely restarted Claude Desktop</li>
                    <li>Verify Node.js is installed and accessible</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-yellow-200 pl-4">
                  <h4 className="font-semibold text-yellow-800 text-sm">API authentication errors</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-yellow-700 mt-2">
                    <li>Double-check your API key is correct</li>
                    <li>Verify the API key hasn't expired</li>
                    <li>Make sure there are no extra spaces in the configuration</li>
                    <li>Check your account has sufficient API credits</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-semibold text-blue-800 text-sm">Network connection issues</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-blue-700 mt-2">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Check if your firewall is blocking the connection</li>
                    <li>Try testing the API directly from your browser</li>
                    <li>Verify the MCP server URL is accessible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Explore More Features:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                    <li>Geocode addresses to coordinates</li>
                    <li>Validate location searches</li>
                    <li>Get detailed census tract information</li>
                    <li>Check Opportunity Zone status in bulk</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Integration Options:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                    <li>Use with other MCP servers</li>
                    <li>Combine with business intelligence tools</li>
                    <li>Integrate into real estate workflows</li>
                    <li>Build custom applications</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Link href="/docs">
                  <Button variant="outline" size="sm">
                    View All Docs
                  </Button>
                </Link>
                <Link href="/playground">
                  <Button size="sm">
                    Try in Playground
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
} 