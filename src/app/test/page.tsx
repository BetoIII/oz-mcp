'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [accessToken, setAccessToken] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testConnection = async () => {
    if (!accessToken) {
      setStatus('Please enter an access token');
      return;
    }

    setIsLoading(true);
    try {
      setStatus('Connecting...');
      setMessages([]);

      const eventSource = new EventSource(`/mcp/sse`, {
        // Note: EventSource doesn't support custom headers, this is a limitation
        // For testing, we'll use a different approach
      });

      eventSource.onopen = () => {
        setStatus('Connected!');
        setMessages(prev => [...prev, 'SSE connection opened']);
      };

      eventSource.onmessage = (event) => {
        setMessages(prev => [...prev, `Message: ${event.data}`]);
      };

      eventSource.onerror = (error) => {
        setStatus('Connection error');
        setMessages(prev => [...prev, `Error: ${error}`]);
        eventSource.close();
      };

      // Clean up on component unmount
      return () => eventSource.close();
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithFetch = async () => {
    if (!accessToken) {
      setStatus('Please enter an access token');
      return;
    }

    setIsLoading(true);
    try {
      setStatus('Testing with fetch...');
      
      const response = await fetch('/mcp/sse', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'text/event-stream',
        }
      });

      setStatus(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const text = await response.text();
        setMessages([`Error response: ${text}`]);
      } else {
        setMessages(['Connection successful with authorization header']);
      }
    } catch (error) {
      setStatus(`Fetch error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestToken = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      setStatus('Getting test access token...');
      
      // First register a client
      const registerResponse = await fetch('/api/oauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: 'Test Client',
          redirect_uris: ['http://localhost:3000/test']
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register client');
      }

      const clientData = await registerResponse.json();
      setMessages(prev => [...prev, `✅ Registered client: ${clientData.client_id}`]);

      // For a real OAuth flow, you'd need to go through the authorization process
      // This is just for testing purposes
      setStatus('Client registered successfully');
      
    } catch (error) {
      setStatus(`Error: ${error}`);
      setMessages(prev => [...prev, `❌ Error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setStatus('Ready to test');
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
              <span className="text-xl font-bold text-slate-900">Connection Test</span>
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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            MCP Connection Test
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Test your API connection and verify OAuth authentication with the Opportunity Zone MCP server.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Test Configuration
              </h2>
              
              {/* Access Token Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your access token here"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Get your access token from the{' '}
                  <Link href="/dashboard" className="text-blue-600 hover:underline">
                    dashboard
                  </Link>
                </p>
              </div>

              {/* Test Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={testWithFetch}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Test Connection (Fetch)</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={testConnection}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Test SSE Connection</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={generateTestToken}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Register Test Client</span>
                    </>
                  )}
                </button>
              </div>

              {/* Clear Button */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={clearMessages}
                  className="w-full bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Clear Messages
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Test
              </h3>
              <ol className="text-amber-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  <span>Click "Register Test Client" to create a test OAuth client</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  <span>
                    Complete the OAuth flow by visiting the{' '}
                    <Link href="/oauth/authorize" className="text-amber-700 underline">
                      OAuth authorize endpoint
                    </Link>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  <span>Exchange the authorization code for an access token via the token endpoint</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                  <span>Enter the access token above and test the connection</span>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> The direct SSE connection won't work because EventSource doesn't support custom headers. Use the fetch test to verify authentication.
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Test Results
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status.includes('Error') || status.includes('error') 
                      ? 'bg-red-500' 
                      : status.includes('successful') || status.includes('Connected')
                      ? 'bg-green-500'
                      : status.includes('Testing') || status.includes('Connecting')
                      ? 'bg-yellow-500'
                      : 'bg-slate-400'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-700">Status</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-800 font-mono text-sm">{status}</p>
                </div>
              </div>

              {/* Messages */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Messages ({messages.length})
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">
                      No messages yet. Run a test to see results here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-700 font-mono">{msg}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Links
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Dashboard</p>
                    <p className="text-sm text-slate-600">Manage OAuth clients and tokens</p>
                  </div>
                </Link>
                
                <Link 
                  href="/playground" 
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">API Playground</p>
                    <p className="text-sm text-slate-600">Test API endpoints interactively</p>
                  </div>
                </Link>
                
                <Link 
                  href="/docs/oauth-flow" 
                  className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">OAuth Documentation</p>
                    <p className="text-sm text-slate-600">Learn about OAuth 2.0 flow</p>
                  </div>
                </Link>
                
                <a 
                  href="https://oz-mcp.vercel.app/mcp/sse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">API Endpoint</p>
                    <p className="text-sm text-slate-600">Direct MCP server access</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 