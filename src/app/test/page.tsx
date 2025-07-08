'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

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
      <Navbar variant="default" title="Connection Test" />

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
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Test Configuration</CardTitle>
                <CardDescription>
                  Configure your access token and run connection tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Access Token Input */}
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Enter your access token here"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get your access token from the{' '}
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                      dashboard
                    </Link>
                  </p>
                </div>

                {/* Test Buttons */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={testConnection}
                      disabled={!accessToken.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Testing...' : 'Test SSE Connection'}
                    </Button>
                    <Button
                      onClick={testWithFetch}
                      disabled={!accessToken.trim() || isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      Test with Fetch
                    </Button>
                  </div>
                  
                  <Button
                    onClick={generateTestToken}
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full"
                  >
                    Register Test Client
                  </Button>
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
              </CardContent>
            </Card>

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
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Test Results</CardTitle>
                <CardDescription>
                  Connection status and response messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status.includes('Error') || status.includes('error') 
                          ? 'bg-destructive' 
                          : status.includes('successful') || status.includes('Connected')
                          ? 'bg-green-600'
                          : status.includes('Testing') || status.includes('Connecting')
                          ? 'bg-yellow-600'
                          : 'bg-muted-foreground'
                      }`}></div>
                      <Badge variant={
                        status.includes('Error') || status.includes('error') 
                          ? 'destructive'
                          : status.includes('successful') || status.includes('Connected')
                          ? 'default'
                          : 'secondary'
                      }>
                        {status}
                      </Badge>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Messages</Label>
                      <Button 
                        onClick={clearMessages}
                        variant="ghost"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                      {messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No messages yet...</p>
                      ) : (
                        <div className="space-y-1">
                          {messages.map((message, index) => (
                            <div key={index} className="text-sm font-mono">
                              {message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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

      <Footer />
    </div>
  );
} 