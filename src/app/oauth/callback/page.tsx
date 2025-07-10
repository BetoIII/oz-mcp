'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering since this page handles OAuth callbacks
export const dynamic = 'force-dynamic';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tokenResponse, setTokenResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('API key copied to clipboard!');
  const processingRef = useRef(false);

  const copyToClipboard = async (text: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (message) {
        setToastMessage(message);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyClaudeConfig = async () => {
    const config = {
      mcpServers: {
        "existing-server": {
          // "... your existing servers"
        },
        "Opportunity Zone MCP": {
          command: "npx",
          args: [
            "-y",
            "mcp-remote",
            `${window.location.origin}/mcp/sse`,
            "--header",
            `Authorization: Bearer ${tokenResponse?.access_token}`
          ]
        }
      }
    };
    
    await copyToClipboard(JSON.stringify(config, null, 2), 'Claude MCP config copied to clipboard!');
  };

  useEffect(() => {
    // Prevent multiple executions
    if (processingRef.current) {
      return;
    }

    const handleCallback = async () => {
      processingRef.current = true;
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for authorization errors
      if (error) {
        setError(errorDescription || error);
        setStatus('error');
        return;
      }

      // Check for missing authorization code
      if (!code) {
        setError('Missing authorization code');
        setStatus('error');
        return;
      }

      try {
        // First, let's get the auth code details to find the client and redirect URI
        const authCodeResponse = await fetch('/api/oauth/auth-code-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!authCodeResponse.ok) {
          throw new Error('Failed to get authorization code information');
        }

        const authCodeData = await authCodeResponse.json();
        const { clientId, redirectUri, clientSecret } = authCodeData;

        // Retrieve stored parameters from localStorage (if available)
        const storedClientId = localStorage.getItem('oauth_client_id');
        const storedClientSecret = localStorage.getItem('oauth_client_secret');
        const storedRedirectUri = localStorage.getItem('oauth_redirect_uri');
        const codeVerifier = localStorage.getItem('oauth_code_verifier');
        const storedState = localStorage.getItem('oauth_state');

        // Use stored parameters if available, otherwise use the ones from the auth code
        const finalClientId = storedClientId || clientId;
        const finalClientSecret = storedClientSecret || clientSecret;
        const finalRedirectUri = storedRedirectUri || redirectUri;

        // Validate state parameter (CSRF protection) only if both are present
        if (state && storedState && state !== storedState) {
          setError('Invalid state parameter - potential CSRF attack');
          setStatus('error');
          return;
        }

        // Exchange authorization code for access token
        const tokenRequest = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: finalRedirectUri,
          client_id: finalClientId,
        });

        // Add client secret if available
        if (finalClientSecret) {
          tokenRequest.append('client_secret', finalClientSecret);
        }

        // Add PKCE code verifier if available
        if (codeVerifier) {
          tokenRequest.append('code_verifier', codeVerifier);
        }

        const response = await fetch('/api/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenRequest,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Token exchange failed');
        }

        // Store the access token (in a real app, you'd want to store this securely)
        localStorage.setItem('oauth_access_token', data.access_token);
        localStorage.setItem('oauth_token_type', data.token_type || 'Bearer');
        localStorage.setItem('oauth_expires_in', data.expires_in?.toString() || '31536000');

        // Clean up temporary OAuth parameters
        localStorage.removeItem('oauth_client_id');
        localStorage.removeItem('oauth_client_secret');
        localStorage.removeItem('oauth_redirect_uri');
        localStorage.removeItem('oauth_code_verifier');
        localStorage.removeItem('oauth_state');

        setTokenResponse(data);
        setStatus('success');
      } catch (err) {
        console.error('Token exchange error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing Authorization</h1>
            <p className="text-slate-600">
              Exchanging authorization code for API key...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Authorization Failed</h1>
            <p className="text-slate-600 mb-6">
              {error || 'An error occurred during the authorization process.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild variant="default" size="lg" className="w-full">
              <Link href="/docs">
                View Documentation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/playground">
                Try Again
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}
        
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">API Key Created Successfully!</h1>
            <p className="text-slate-600 mb-6">
              Your application has been successfully authorized and you have received an API key.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">API Key Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Token Type:</span>
                  <code className="text-gray-800 bg-white px-3 py-1 rounded border">{tokenResponse?.token_type || 'Bearer'}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expires In:</span>
                  <code className="text-gray-800 bg-white px-3 py-1 rounded border">1 month</code>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Key:</span>
                    <button
                      onClick={() => copyToClipboard(tokenResponse?.access_token || '', 'API key copied to clipboard!')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Copy</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <code className="text-gray-800 text-xs font-mono break-all leading-relaxed">
                      {tokenResponse?.access_token}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Use the API key to make authenticated API requests</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Include it in the Authorization header as: <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">Bearer {tokenResponse?.access_token?.substring(0, 16)}...</code></span>
                </li>
                
              </ul>
            </div>

            {/* Cloud Config Preview */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Claude MCP Configuration</h3>
                <button
                  onClick={() => {
                    const config = {
                      mcpServers: {
                        "existing-server": {
                          // "... your existing servers"
                        },
                        "Opportunity Zone MCP": {
                          command: "npx",
                          args: [
                            "-y",
                            "mcp-remote",
                            `${window.location.origin}/mcp/sse`,
                            "--header",
                            `Authorization: Bearer ${tokenResponse?.access_token}`
                          ]
                        }
                      }
                    };
                    copyToClipboard(JSON.stringify(config, null, 2), 'Claude MCP config copied to clipboard!');
                  }}
                  className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                  title="Copy configuration"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono">{`{
  "mcpServers": {
    "existing-server": {
      // ... your existing servers
    },
    "Opportunity Zone MCP": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${window.location.origin}/mcp/sse",
        "--header",
        "Authorization: Bearer `}<span className="text-gray-500">{'*'.repeat(32)}</span>{`"
      ]
    }
  }
}`}</pre>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Copy this configuration object to your Claude desktop app's MCP settings file. Click the copy icon to get the complete config with your API key.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={copyClaudeConfig}
              variant="default"
              size="lg"
              className="flex-1"
            >
              Copy Claude Config
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/playground">
                Test API in Playground
              </Link>
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
            <p className="text-slate-600">
              Preparing OAuth callback...
            </p>
          </div>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
} 