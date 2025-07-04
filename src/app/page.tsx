import { auth, signIn, signOut } from "./auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OZ</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Opportunity Zone MCP</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/docs/oauth-flow" className="text-slate-600 hover:text-slate-900 transition-colors">
                Docs
              </Link>
              <Link href="/playground" className="text-slate-600 hover:text-slate-900 transition-colors">
                Playground
              </Link>
              {session?.user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <form action={async () => { 'use server'; await signOut(); }}>
                    <button 
                      type="submit"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <form action={async () => { 'use server'; await signIn('google'); }}>
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
              Geospatial AI for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Opportunity Zones
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure, OAuth-protected MCP server providing intelligent geospatial data and geocoding services for AI applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {session?.user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                  >
                    Open Dashboard
                  </Link>
                  <Link 
                    href="/playground" 
                    className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all border-2 border-slate-200 font-semibold text-lg"
                  >
                    Try Playground
                  </Link>
                </>
              ) : (
                <>
                  <form action={async () => { 'use server'; await signIn('google'); }}>
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                    >
                      Get Started Free
                    </button>
                  </form>
                  <Link 
                    href="/docs/oauth-flow" 
                    className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all border-2 border-slate-200 font-semibold text-lg"
                  >
                    View Documentation
                  </Link>
                </>
              )}
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 text-slate-500 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>OAuth 2.0 Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>PKCE Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>MCP Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful AI Tools for Location Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for developers, designed for scale. Our MCP server provides enterprise-grade geospatial capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Zone Checking</h3>
              <p className="text-slate-600">
                Instantly verify if any address or coordinate falls within opportunity zones with high accuracy.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Geocoding</h3>
              <p className="text-slate-600">
                Transform addresses into precise coordinates using advanced geocoding algorithms.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Real-time Status</h3>
              <p className="text-slate-600">
                Monitor service health and data freshness with comprehensive status reporting.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Data Refresh</h3>
              <p className="text-slate-600">
                Keep your data current with on-demand refresh capabilities and automated updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built with security-first architecture and industry-standard authentication protocols.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">OAuth 2.0 Protected</h3>
              <p className="text-slate-600 mb-4">
                All API access requires OAuth 2.0 authentication with secure token-based authorization.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• PKCE support for enhanced security</li>
                <li>• Google OAuth integration</li>
                <li>• Token expiration handling</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">HTTPS Everywhere</h3>
              <p className="text-slate-600 mb-4">
                All communications encrypted with TLS 1.3 and strict security headers.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• HSTS enabled</li>
                <li>• Secure cookie handling</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Rate Limiting</h3>
              <p className="text-slate-600 mb-4">
                Advanced rate limiting and abuse protection to ensure service reliability.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Per-client rate limits</li>
                <li>• DDoS protection</li>
                <li>• Fair usage policies</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Simple setup process to get your AI applications connected to opportunity zone data.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign In</h3>
                <p className="text-blue-100 mb-4">
                  Authenticate with your Google account to access the developer dashboard.
                </p>
                {!session?.user && (
                  <form action={async () => { 'use server'; await signIn('google'); }}>
                    <button 
                      type="submit"
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Sign In Now
                    </button>
                  </form>
                )}
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Client</h3>
                <p className="text-green-100 mb-4">
                  Register your application and configure OAuth settings in the dashboard.
                </p>
                {session?.user && (
                  <Link 
                    href="/dashboard" 
                    className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium inline-block"
                  >
                    Open Dashboard
                  </Link>
                )}
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Building</h3>
              <p className="text-purple-100 mb-4">
                Get your access token and start making API calls to power your AI applications.
              </p>
              <Link 
                href="/playground" 
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium inline-block"
              >
                Try API
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Developer Resources
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to integrate and build with our geospatial AI platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/docs/oauth-flow" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group-hover:border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">OAuth Guide</h3>
                <p className="text-slate-600 text-sm">Complete OAuth 2.0 flow documentation with examples</p>
              </div>
            </Link>
            
            <Link href="/playground" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group-hover:border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">API Playground</h3>
                <p className="text-slate-600 text-sm">Interactive testing environment for all API endpoints</p>
              </div>
            </Link>
            
            <Link href="/test" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group-hover:border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Connection Test</h3>
                <p className="text-slate-600 text-sm">Verify your setup and test API connectivity</p>
              </div>
            </Link>
            
            <a href="https://oz-mcp.vercel.app" target="_blank" rel="noopener noreferrer" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all group-hover:border-orange-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">API Endpoint</h3>
                <p className="text-slate-600 text-sm">Direct access to the MCP server endpoint</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* User Profile Section */}
      {session?.user && (
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center space-x-4">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-16 h-16 rounded-full border-2 border-blue-200"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Welcome back, {session.user.name?.split(' ')[0]}!
                  </h3>
                  <p className="text-slate-600">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OZ</span>
              </div>
              <span className="text-xl font-bold">Opportunity Zone MCP Server</span>
            </div>
            <p className="text-slate-400 mb-4">
              Secure geospatial data and AI services for opportunity zone analysis
            </p>
            <div className="bg-slate-800 rounded-lg px-4 py-2 inline-block">
              <code className="text-slate-300 text-sm">https://oz-mcp.vercel.app</code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
