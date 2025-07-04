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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Playground</h1>
              <p className="text-gray-600 mt-1">
                Test the Opportunity Zone MCP API with your access token
              </p>
            </div>
            <Link 
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Need an access token?</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Sign in and create an OAuth client in the <Link href="/dashboard" className="underline">dashboard</Link> to get started.
            </p>
            <p className="text-sm text-blue-700">
              Complete the OAuth flow to obtain an access token for API access.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Request Configuration
              </h2>
              
              {/* Access Token */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token *
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your access token"
                />
              </div>

              {/* Tool Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tool
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => handleToolChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(tools).map(([key, tool]) => (
                    <option key={key} value={key}>
                      {tool.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {tools[selectedTool as keyof typeof tools].description}
                </p>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameters
                </label>
                {Object.keys(tools[selectedTool as keyof typeof tools].parameters).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(tools[selectedTool as keyof typeof tools].parameters).map(([key, description]) => (
                      <div key={key}>
                        <label className="block text-xs text-gray-600 mb-1">
                          {key} - {description}
                        </label>
                        <input
                          type="text"
                          value={params[key] || ''}
                          onChange={(e) => handleParamChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No parameters required</p>
                )}
              </div>

              {/* Execute Button */}
              <button
                onClick={executeRequest}
                disabled={isLoading || !accessToken}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Executing...' : 'Execute Request'}
              </button>
            </div>

            {/* Examples */}
            {exampleRequests[selectedTool as keyof typeof exampleRequests] && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Example Requests
                </h3>
                <div className="space-y-3">
                  {exampleRequests[selectedTool as keyof typeof exampleRequests].examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <button
                        onClick={() => setParams(Object.fromEntries(
                          Object.entries(example).filter(([_, value]) => value !== undefined)
                        ))}
                        className="text-left w-full text-sm hover:bg-gray-100 p-2 rounded transition-colors"
                      >
                        {Object.entries(example).map(([key, value]) => (
                          <div key={key} className="mb-1">
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Response
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium text-red-800">Error</span>
                </div>
                <p className="text-sm text-red-700 font-mono">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Success</span>
                  </div>
                  <p className="text-sm text-green-700">Request executed successfully</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Response Content:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                    {response.content && response.content.length > 0 ? (
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {response.content[0].text}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No content returned</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Raw Response:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                    <pre className="text-xs text-gray-600 font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!response && !error && !isLoading && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600">
                  Configure your request and click "Execute Request" to see the response here.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Executing request...</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Request Format
          </h2>
          <p className="text-gray-600 mb-4">
            The playground sends requests in MCP (Model Context Protocol) format. Here's what gets sent:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 font-mono">
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