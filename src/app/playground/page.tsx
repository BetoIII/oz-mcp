'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, Check, AlertCircle, RefreshCw, Zap } from 'lucide-react';

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
  const [copiedExample, setCopiedExample] = useState<string>('');

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
          const cacheLoaded = statusText.includes('Cache loaded: ✅ Yes');
          const dbHasData = statusText.includes('Database has data: ✅ Yes');
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

          // If database has data but cache isn't loaded, try to trigger cache loading
          if (dbHasData && !cacheLoaded && !isInitialized) {
            console.log('Database has data but cache not loaded, attempting to trigger cache loading...');
            // Try a simple check request to force cache loading
            setTimeout(() => {
              triggerCacheLoading();
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Error checking service status:', error);
      setServiceStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to trigger cache loading by making a simple check request
  const triggerCacheLoading = async () => {
    if (!accessToken) return;
    
    try {
      console.log('Triggering cache loading with simple check request...');
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'check_opportunity_zone',
          arguments: {
            latitude: '38.8977',
            longitude: '-77.0365'
          },
        },
      };

      await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Check status again after a short delay
      setTimeout(() => {
        checkServiceStatus();
      }, 3000);
    } catch (error) {
      console.log('Cache loading trigger failed:', error);
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
      icon: '🎯',
      parameters: {
        address: 'Address to check (optional, alternative to coordinates)',
        latitude: 'Latitude (optional, alternative to address)',
        longitude: 'Longitude (optional, alternative to address)',
      },
    },
    geocode_address: {
      name: 'Geocode Address',
      description: 'Convert an address to coordinates',
      icon: '📍',
      parameters: {
        address: 'Address to geocode',
      },
    },
    get_oz_status: {
      name: 'Get Service Status',
      description: 'Get opportunity zone service status and cache information',
      icon: '📊',
      parameters: {},
    },
    refresh_oz_data: {
      name: 'Refresh Data',
      description: 'Force refresh of opportunity zone data',
      icon: '🔄',
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

  const copyExample = (example: Record<string, string>) => {
    setParams(example);
    setCopiedExample(JSON.stringify(example));
    setTimeout(() => setCopiedExample(''), 2000);
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

  const exampleRequests: Record<string, Record<string, string>[]> = {
    check_opportunity_zone: [
      { address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' },
      { address: '350 Fifth Avenue, New York, NY 10118' },
      { latitude: '38.8977', longitude: '-77.0365' },
    ],
    geocode_address: [
      { address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' },
      { address: 'Times Square, New York, NY' },
    ],
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
              <Link href="/docs" className="text-slate-600 hover:text-slate-900 transition-colors">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Interactive API Playground
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Test the Opportunity Zone MCP API in real-time. Explore all endpoints, see live responses, and perfect your integration.
          </p>
        </motion.div>

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
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Authentication</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter your access token"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your token from the{' '}
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                  dashboard
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${serviceStatus.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-semibold text-slate-900">
                  Service Status: {serviceStatus.isInitialized ? 'Ready' : 'Warming up...'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {serviceStatus.featureCount && (
                  <span className="text-sm text-slate-600">
                    {serviceStatus.featureCount.toLocaleString()} zones loaded
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkServiceStatus}
                  disabled={serviceStatus.isLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${serviceStatus.isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tool Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Tool</h2>
              
              <div className="space-y-3">
                {Object.entries(tools).map(([key, tool]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToolChange(key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTool === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-semibold text-slate-900">{tool.name}</span>
                    </div>
                    <p className="text-sm text-slate-600">{tool.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Example Requests */}
            {exampleRequests[selectedTool as keyof typeof exampleRequests] && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Example Requests</h2>
                
                <div className="space-y-3">
                  {exampleRequests[selectedTool as keyof typeof exampleRequests]?.map((example, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => copyExample(example)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {Object.entries(example).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-slate-700">{key}:</span>{' '}
                              <span className="text-slate-600">{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="ml-2">
                          {copiedExample === JSON.stringify(example) ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parameters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Parameters</h2>
              
              {Object.keys(tools[selectedTool as keyof typeof tools].parameters).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(tools[selectedTool as keyof typeof tools].parameters).map(([key, description]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {key} {key === 'address' && selectedTool === 'check_opportunity_zone' ? '(optional)' : ''}
                      </label>
                      <input
                        type="text"
                        value={params[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={description}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 italic">No parameters required for this tool.</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={executeRequest}
                disabled={isLoading || !accessToken}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Play className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Executing...' : 'Execute Request'}</span>
              </motion.button>
            </motion.div>

            {/* Response */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Response</h2>
              
              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-900">Error</span>
                      </div>
                      <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
                    </motion.div>
                  ) : response ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-900">Success</span>
                      </div>
                      <pre className="text-green-700 text-sm whitespace-pre-wrap bg-white rounded p-3 border border-green-200 overflow-x-auto">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center"
                    >
                      <div className="text-slate-400 mb-4">
                        <Play className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-slate-600">
                        Execute a request to see the response here
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}