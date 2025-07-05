'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiResponse {
  content?: Array<{
    type: string;
    text: string;
  }>;
  error?: string;
}

export default function PlaygroundPage() {
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('check_opportunity_zone');
  const [params, setParams] = useState<Record<string, string>>({
    address: '',
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');

  // OAuth-related state
  const [oauthClient, setOauthClient] = useState<{ clientId: string; clientSecret: string } | null>(null);
  const [showOAuthSetup, setShowOAuthSetup] = useState<boolean>(false);

  // Service status monitoring
  const [serviceStatus, setServiceStatus] = useState<{
    isInitialized: boolean;
    lastUpdated?: string;
    featureCount?: number;
    isLoading: boolean;
  }>({ isInitialized: false, isLoading: false });
  const [autoRefreshStatus, setAutoRefreshStatus] = useState<boolean>(false);

  // Load stored access token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('oauth_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  // Function to initiate OAuth flow
  const initiateOAuth = () => {
    if (!oauthClient) {
      setShowOAuthSetup(true);
      return;
    }

    // Generate PKCE parameters
    const generateCodeVerifier = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
    };

    const generateCodeChallenge = async (verifier: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const startOAuthFlow = async () => {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = crypto.getRandomValues(new Uint32Array(1))[0].toString();
      
      const redirectUri = `${window.location.origin}/oauth/callback`;
      
      // Store OAuth parameters
      localStorage.setItem('oauth_client_id', oauthClient.clientId);
      localStorage.setItem('oauth_client_secret', oauthClient.clientSecret);
      localStorage.setItem('oauth_redirect_uri', redirectUri);
      localStorage.setItem('oauth_code_verifier', codeVerifier);
      localStorage.setItem('oauth_state', state);
      
      // Build authorization URL
      const authUrl = new URL('/oauth/authorize', window.location.origin);
      authUrl.searchParams.set('client_id', oauthClient.clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'api:read');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      
      // Redirect to authorization page
      window.location.href = authUrl.toString();
    };

    startOAuthFlow();
  };

  // Function to check service status
  const checkServiceStatus = async () => {
    if (!accessToken) return;
    
    setServiceStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_oz_status',
          arguments: {},
        },
      };

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.result?.content?.[0]?.text) {
          const statusText = result.result.content[0].text;
          const isInitialized = statusText.includes('Initialized: ✅ Yes');
          const featureMatch = statusText.match(/Feature count: (\d+)/);
          const featureCount = featureMatch ? parseInt(featureMatch[1]) : 0;
          const lastUpdatedMatch = statusText.match(/Last updated: ([^\n]+)/);
          const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : undefined;
          
          setServiceStatus({
            isInitialized,
            featureCount,
            lastUpdated,
            isLoading: false
          });
        }
      }
    } catch (error) {
      console.error('Error checking service status:', error);
      setServiceStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Auto-refresh status when access token is available
  useEffect(() => {
    if (accessToken && autoRefreshStatus) {
      const interval = setInterval(checkServiceStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [accessToken, autoRefreshStatus]);

  // Check status once when access token is loaded
  useEffect(() => {
    if (accessToken) {
      checkServiceStatus();
    }
  }, [accessToken]);

  const tools = {
    check_opportunity_zone: {
      name: 'Check Opportunity Zone',
      description: 'Check if coordinates or an address is in an opportunity zone',
      parameters: {
        address: 'Address to check (optional, alternative to coordinates)',
        latitude: 'Latitude (optional, alternative to address)',
        longitude: 'Longitude (optional, alternative to address)',
      },
    },
    geocode_address: {
      name: 'Geocode Address',
      description: 'Convert an address to coordinates',
      parameters: {
        address: 'Address to geocode',
      },
    },
    get_oz_status: {
      name: 'Get Service Status',
      description: 'Get opportunity zone service status and cache information',
      parameters: {},
    },
    refresh_oz_data: {
      name: 'Refresh Data',
      description: 'Force refresh of opportunity zone data',
      parameters: {},
    },
  };

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
    setParams({});
    setResponse(null);
    setError('');
  };

  const handleParamChange = (key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const executeRequest = async () => {
    if (!accessToken) {
      setError('Please enter an access token');
      return;
    }

    // Check if service is ready for OZ queries
    if ((selectedTool === 'check_opportunity_zone' || selectedTool === 'geocode_address') && !serviceStatus.isInitialized) {
      setError('Service is still warming up. Please wait for the green "Ready" status above before testing opportunity zone queries.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: selectedTool,
          arguments: params,
        },
      };

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'API Error');
      }

      setResponse(result.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleRequests = {
    check_opportunity_zone: {
      address: 'address',
      examples: [
        { address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' },
        { address: '350 Fifth Avenue, New York, NY 10118' },
        { latitude: '38.8977', longitude: '-77.0365' },
      ],
    },
    geocode_address: {
      address: 'address',
      examples: [
        { address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' },
        { address: 'Times Square, New York, NY' },
      ],
    },
  };

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
              <span className="text-xl font-bold text-slate-900">API Playground</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/test" className="text-slate-600 hover:text-slate-900 transition-colors">
                Test
              </Link>
              <Link href="/docs/oauth-flow" className="text-slate-600 hover:text-slate-900 transition-colors">
                Docs
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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            API Playground
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Test the Opportunity Zone MCP API with your access token and explore all available endpoints.
          </p>
        </div>

        {/* OAuth Setup Modal */}
        {showOAuthSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">OAuth Setup</h3>
                <p className="text-slate-600">Enter your OAuth client credentials to get started</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your client ID"
                    onChange={(e) => setOauthClient(prev => ({ ...prev, clientId: e.target.value, clientSecret: prev?.clientSecret || '' }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client Secret</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your client secret"
                    onChange={(e) => setOauthClient(prev => ({ ...prev, clientSecret: e.target.value, clientId: prev?.clientId || '' }))}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Don't have OAuth credentials? Create them in the{' '}
                    <Link href="/dashboard" className="underline font-medium">
                      dashboard
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowOAuthSetup(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowOAuthSetup(false);
                    initiateOAuth();
                  }}
                  disabled={!oauthClient?.clientId || !oauthClient?.clientSecret}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start OAuth Flow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Authentication</h2>
          </div>
          
          <div className="p-6">
            {accessToken ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Access token loaded</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Enter your access token"
                    />
                    <button
                      onClick={() => {
                        setAccessToken('');
                        localStorage.removeItem('oauth_access_token');
                      }}
                      className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Get Started with OAuth</h3>
                <p className="text-slate-600 mb-6">
                  Use OAuth 2.0 to securely authenticate and get an access token
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={initiateOAuth}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start OAuth Flow
                  </button>
                  <div className="text-slate-500 text-sm flex items-center">
                    or
                  </div>
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Enter access token manually"
                    />
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Need OAuth credentials?{' '}
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                      Create them in the dashboard
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to get started</h3>
              <p className="text-blue-800 mb-2">
                1. Create an OAuth client in the{' '}
                <Link href="/dashboard" className="underline font-medium">
                  dashboard
                </Link>
              </p>
              <p className="text-blue-800 mb-2">
                2. Complete the OAuth flow above to get an access token
              </p>
              <p className="text-blue-700 text-sm">
                3. Select a tool below and test your API requests!
              </p>
            </div>
          </div>
        </div>

        {/* Service Status Indicator */}
        {accessToken && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Service Status</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAutoRefreshStatus(!autoRefreshStatus)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      autoRefreshStatus
                        ? 'bg-white text-green-600'
                        : 'bg-green-500 text-white hover:bg-green-400'
                    }`}
                  >
                    {autoRefreshStatus ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </button>
                  <button
                    onClick={checkServiceStatus}
                    disabled={serviceStatus.isLoading}
                    className="px-3 py-1 bg-white text-green-600 rounded-full text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    {serviceStatus.isLoading ? 'Checking...' : 'Refresh'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!accessToken) return;
                      
                      try {
                        const requestBody = {
                          jsonrpc: '2.0',
                          id: 1,
                          method: 'tools/call',
                          params: {
                            name: 'refresh_oz_data',
                            arguments: {},
                          },
                        };

                        const response = await fetch('/api/mcp', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify(requestBody),
                        });

                        if (response.ok) {
                          const result = await response.json();
                          if (result.result?.content?.[0]?.text) {
                            console.log('Refresh result:', result.result.content[0].text);
                          }
                          // Check status after refresh
                          setTimeout(checkServiceStatus, 1000);
                        }
                      } catch (error) {
                        console.error('Error forcing refresh:', error);
                      }
                    }}
                    disabled={serviceStatus.isLoading}
                    className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    Force Refresh
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      serviceStatus.isInitialized ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-slate-700">
                      {serviceStatus.isInitialized ? 'Ready' : 'Initializing'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {serviceStatus.isInitialized 
                      ? 'Service is ready for queries' 
                      : 'Service is warming up...'}
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">Features</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {serviceStatus.featureCount?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-500">Opportunity zones loaded</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">Last Updated</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {serviceStatus.lastUpdated 
                      ? new Date(serviceStatus.lastUpdated).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>
              
              {!serviceStatus.isInitialized && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Service is warming up</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        The opportunity zone service is loading data from external sources. This typically takes 30-60 seconds on first startup.
                        {autoRefreshStatus && ' Status will update automatically.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Builder */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Request Builder
              </h2>
              
              {/* Tool Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Tool
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => handleToolChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(tools).map(([key, tool]) => (
                    <option key={key} value={key}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </select>
                
                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    {tools[selectedTool as keyof typeof tools].description}
                  </p>
                </div>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parameters
                </label>
                {Object.keys(tools[selectedTool as keyof typeof tools].parameters).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(tools[selectedTool as keyof typeof tools].parameters).map(([key, description]) => (
                      <div key={key} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {key}
                        </label>
                        <p className="text-xs text-slate-500 mb-2">{description}</p>
                        <input
                          type="text"
                          value={params[key] || ''}
                          onChange={(e) => handleParamChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    <p className="text-sm text-slate-500">No parameters required for this tool</p>
                  </div>
                )}
              </div>

              {/* Execute Button */}
              <button
                onClick={executeRequest}
                disabled={
                  isLoading || 
                  !accessToken || 
                  ((selectedTool === 'check_opportunity_zone' || selectedTool === 'geocode_address') && !serviceStatus.isInitialized)
                }
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing...</span>
                  </>
                ) : !accessToken ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Authentication Required</span>
                  </>
                ) : (selectedTool === 'check_opportunity_zone' || selectedTool === 'geocode_address') && !serviceStatus.isInitialized ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Service Warming Up...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Execute Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Examples */}
            {exampleRequests[selectedTool as keyof typeof exampleRequests] && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Example Requests
                </h3>
                <div className="space-y-3">
                  {exampleRequests[selectedTool as keyof typeof exampleRequests].examples.map((example, index) => (
                    <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setParams(Object.fromEntries(
                          Object.entries(example).filter(([_, value]) => value !== undefined)
                        ))}
                        className="text-left w-full hover:bg-white/50 p-2 rounded transition-colors"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm font-medium text-slate-900">Example {index + 1}</span>
                        </div>
                        {Object.entries(example).map(([key, value]) => (
                          <div key={key} className="text-sm text-slate-600 ml-6">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Response
              </h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">Error</span>
                  </div>
                  <div className="bg-red-100 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-mono">{error}</p>
                  </div>
                </div>
              )}

              {response && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Success</span>
                    </div>
                    <p className="text-sm text-green-700">Request executed successfully</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Response Content:</h3>
                    <div className="bg-slate-50 p-4 rounded-xl overflow-auto border border-slate-200">
                      {response.content && response.content.length > 0 ? (
                        <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                          {response.content[0].text}
                        </pre>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No content returned</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Raw Response:</h3>
                    <div className="bg-slate-50 p-4 rounded-xl overflow-auto border border-slate-200">
                      <pre className="text-xs text-slate-600 font-mono">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {!response && !error && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to test</h3>
                  <p className="text-slate-600">
                    Configure your request and click "Execute Request" to see the response here.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Executing request...</h3>
                  <p className="text-slate-600">Please wait while we process your API call.</p>
                </div>
              )}
            </div>

            {/* Request Format Documentation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Request Format
              </h2>
              <p className="text-slate-600 mb-4">
                The playground sends requests in MCP (Model Context Protocol) format. Here's what gets sent to the API:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700">JSON-RPC 2.0 Request</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                    POST /api/mcp
                  </span>
                </div>
                <pre className="text-sm text-slate-800 font-mono overflow-x-auto">
{JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: selectedTool,
    arguments: params,
  },
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}