'use client';

import { useState } from 'react';
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

      const response = await fetch('/mcp/sse', {
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

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need an access token?</h3>
              <p className="text-blue-800 mb-2">
                Sign in and create an OAuth client in the{' '}
                <Link href="/dashboard" className="underline font-medium">
                  dashboard
                </Link>{' '}
                to get started.
              </p>
              <p className="text-blue-700 text-sm">
                Complete the OAuth flow to obtain an access token for API access.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Request Configuration
              </h2>
              
              {/* Access Token */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Access Token *
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your access token"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Get your access token from the{' '}
                  <Link href="/dashboard" className="text-blue-600 hover:underline">
                    dashboard
                  </Link>
                </p>
              </div>

              {/* Tool Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  API Tool
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => handleToolChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(tools).map(([key, tool]) => (
                    <option key={key} value={key}>
                      {tool.name}
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
                disabled={isLoading || !accessToken}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing...</span>
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
          </div>
        </div>

        {/* Request Format Documentation */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Request Format
          </h2>
          <p className="text-slate-600 mb-6">
            The playground sends requests in MCP (Model Context Protocol) format. Here's what gets sent to the API:
          </p>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">JSON-RPC 2.0 Request</h3>
              <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                POST /mcp/sse
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
  );
}