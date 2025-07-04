import { auth, signIn, signOut } from "./auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Opportunity Zone MCP Server
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A secure, OAuth-protected MCP (Model Context Protocol) server providing 
            geospatial opportunity zone data and geocoding services for AI applications.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🚀 What is this?
            </h2>
            <p className="text-gray-600 mb-4">
              This MCP server provides AI models with access to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Check if coordinates or addresses are in opportunity zones</li>
              <li>Geocode addresses to coordinates</li>
              <li>Get opportunity zone service status</li>
              <li>Refresh opportunity zone data</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔐 OAuth 2.0 Protected
            </h2>
            <p className="text-gray-600 mb-4">
              All API access requires OAuth 2.0 authentication with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>PKCE (Proof Key for Code Exchange) support</li>
              <li>Secure token-based authentication</li>
              <li>Google OAuth integration</li>
              <li>Token expiration and refresh handling</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🛠️ Quick Start
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sign In</h3>
              <p className="text-sm text-gray-600">
                Sign in with Google to access the developer dashboard
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Register Client</h3>
              <p className="text-sm text-gray-600">
                Create an OAuth client application for your project
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Token</h3>
              <p className="text-sm text-gray-600">
                Obtain an access token and start using the API
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          {session?.user ? (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-12 h-12 rounded-full mr-3"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Welcome, {session.user.name}!
                  </p>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Link 
                  href="/dashboard" 
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <form action={async () => { 'use server'; await signOut(); }}>
                  <button 
                    type="submit"
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-4">
                Sign in with Google to access the developer dashboard and create your first OAuth client.
              </p>
              <form action={async () => { 'use server'; await signIn('google'); }}>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Sign in with Google
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📚 Documentation
            </h2>
            <p className="text-gray-600 mb-4">
              Complete guides and examples for integrating with the MCP server:
            </p>
            <div className="space-y-2">
              <Link href="/docs/getting-started" className="block text-blue-600 hover:underline">
                Getting Started Guide
              </Link>
              <Link href="/docs/oauth-flow" className="block text-blue-600 hover:underline">
                OAuth 2.0 Flow
              </Link>
              <Link href="/docs/api-reference" className="block text-blue-600 hover:underline">
                API Reference
              </Link>
              <Link href="/docs/examples" className="block text-blue-600 hover:underline">
                Code Examples
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🧪 Try It Out
            </h2>
            <p className="text-gray-600 mb-4">
              Test the API and explore its capabilities:
            </p>
            <div className="space-y-2">
              <Link href="/playground" className="block text-blue-600 hover:underline">
                Interactive Playground
              </Link>
              <Link href="/test" className="block text-blue-600 hover:underline">
                Connection Test
              </Link>
              <a 
                href="https://oz-mcp.vercel.app/mcp/sse" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                API Endpoint
              </a>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Opportunity Zone MCP Server - Secure geospatial data for AI applications
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Server URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://oz-mcp.vercel.app</code>
          </p>
        </footer>
      </div>
    </div>
  );
}
