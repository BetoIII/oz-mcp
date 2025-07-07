import Link from 'next/link';
import { ArrowRight, Book, Code, Zap, Shield, Users } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OZ</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Documentation</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/playground" className="text-slate-600 hover:text-slate-900 transition-colors">
                Playground
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link 
                href="/" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            OZ-MCP Documentation
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Everything you need to integrate Opportunity Zone verification into your applications, AI assistants, and workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/docs/oauth-flow" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>Quick Start Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/playground" 
              className="bg-white text-slate-700 px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors font-medium flex items-center space-x-2"
            >
              <Code className="w-4 h-4" />
              <span>Try in Playground</span>
            </Link>
          </div>
        </div>

        {/* Main Documentation Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Getting Started */}
          <Link href="/docs/oauth-flow" className="group">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:border-blue-300 transition-all duration-300 p-8 h-full">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Getting Started</h3>
              <p className="text-slate-600 mb-4">
                Complete OAuth 2.0 setup guide with PKCE authentication flow and step-by-step integration instructions.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                <span>Read guide</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* API Reference */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 h-full">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Book className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">API Reference</h3>
            <p className="text-slate-600 mb-4">
              Comprehensive API documentation for all endpoints, tools, and response formats.
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <h4 className="font-medium text-slate-900 text-sm">MCP Tools</h4>
                <ul className="text-xs text-slate-600 mt-1 space-y-1">
                  <li>• check_opportunity_zone</li>
                  <li>• geocode_address</li>
                  <li>• get_oz_status</li>
                  <li>• refresh_oz_data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Assistant Integration */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 h-full">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Assistant Setup</h3>
            <p className="text-slate-600 mb-4">
              Integration guides for Claude Desktop, ChatGPT, and other AI assistants.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Claude Desktop/Web
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                ChatGPT Functions
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Custom Integrations
              </div>
            </div>
          </div>
        </div>

        {/* Claude Desktop Integration */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-16">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Claude Desktop Integration</h2>
              <p className="text-slate-600">Add OZ-MCP as an MCP server in Claude Desktop</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration</h3>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">1. Open Claude Desktop Settings</p>
                <p className="text-xs text-slate-600">Navigate to Settings → MCP Servers</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">2. Add Server Configuration</p>
                <div className="bg-slate-800 rounded p-3 mt-2">
                  <code className="text-green-400 text-xs">
                    {`{
  "oz-mcp": {
    "command": "node",
    "args": [],
    "env": {
      "OZ_MCP_URL": "https://oz-mcp.vercel.app/mcp/sse",
      "OAUTH_TOKEN": "your_access_token_here"
    }
  }
}`}
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Usage Examples</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Address Check</p>
                  <p className="text-xs text-blue-700">"Check if 1600 Pennsylvania Avenue NW, Washington, DC is in an opportunity zone"</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 mb-2">Bulk Analysis</p>
                  <p className="text-xs text-green-700">"Analyze these 5 addresses for opportunity zone status and create a summary report"</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-2">Investment Research</p>
                  <p className="text-xs text-purple-700">"Find opportunity zones in Miami, Florida and tell me about potential tax benefits"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Quick Reference</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Base URLs</h3>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">MCP (Claude/SSE)</p>
                  <code className="text-green-400 text-xs">https://oz-mcp.vercel.app/mcp/sse</code>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">REST API</p>
                  <code className="text-green-400 text-xs">https://oz-mcp.vercel.app/api</code>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">OAuth</p>
                  <code className="text-green-400 text-xs">https://oz-mcp.vercel.app/oauth</code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Authentication</h3>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">Header Format</p>
                  <code className="text-green-400 text-xs">Authorization: Bearer your_token_here</code>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">Scope</p>
                  <code className="text-green-400 text-xs">api:read</code>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-sm text-slate-300">Flow</p>
                  <code className="text-green-400 text-xs">OAuth 2.0 with PKCE</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Need Help?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Try these resources or get in touch.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              href="/playground" 
              className="bg-blue-50 hover:bg-blue-100 rounded-lg p-6 transition-colors"
            >
              <Code className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Interactive Playground</h3>
              <p className="text-sm text-slate-600">Test API calls in real-time</p>
            </Link>
            
            <div className="bg-green-50 rounded-lg p-6">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Status Page</h3>
              <p className="text-sm text-slate-600">Check service availability</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Community Support</h3>
              <p className="text-sm text-slate-600">Get help from other developers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}