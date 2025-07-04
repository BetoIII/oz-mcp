import Link from 'next/link';

export default function OAuthFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">OAuth 2.0 Flow</h1>
              <p className="text-gray-600 mt-1">
                Complete guide to implementing OAuth 2.0 authentication with the MCP server
              </p>
            </div>
            <Link 
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Overview
          </h2>
          <p className="text-gray-600 mb-4">
            The Opportunity Zone MCP server uses OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) 
            for secure authentication. This flow is designed to work with both confidential and public clients.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A registered OAuth client (created in the dashboard)</li>
              <li>• A redirect URI where users will be sent after authorization</li>
              <li>• Your application's client ID and secret</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Step-by-Step Implementation
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 1: Register Your Application
              </h3>
              <p className="text-gray-600 mb-4">
                First, you need to register your application in the developer dashboard.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Manual Registration:</h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Sign in to the <Link href="/dashboard" className="text-blue-600 hover:underline">dashboard</Link></li>
                  <li>2. Click "Create New Client"</li>
                  <li>3. Enter your application name</li>
                  <li>4. Add your redirect URIs (one per line)</li>
                  <li>5. Save your client ID and secret</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">API Registration:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`POST https://oz-mcp.vercel.app/api/oauth/register
Content-Type: application/json

{
  "client_name": "My Application",
  "redirect_uris": [
    "https://yourapp.com/callback",
    "http://localhost:3000/callback"
  ]
}`}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 2: Generate PKCE Parameters (Recommended)
              </h3>
              <p className="text-gray-600 mb-4">
                For enhanced security, especially for public clients, generate PKCE parameters.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">JavaScript Example:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`import crypto from 'crypto';

// Generate code verifier
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Store codeVerifier for later use
localStorage.setItem('code_verifier', codeVerifier);`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 3: Redirect User to Authorization Server
              </h3>
              <p className="text-gray-600 mb-4">
                Redirect the user to the authorization endpoint with the required parameters.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Authorization URL:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`https://oz-mcp.vercel.app/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fyourapp.com%2Fcallback&response_type=code&scope=api%3Aread&state=random_state_value&code_challenge=CODE_CHALLENGE&code_challenge_method=S256`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Parameters:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>client_id:</strong> Your application's client ID</li>
                  <li><strong>redirect_uri:</strong> Where to redirect after authorization</li>
                  <li><strong>response_type:</strong> Must be "code"</li>
                  <li><strong>scope:</strong> Requested permissions (e.g., "api:read")</li>
                  <li><strong>state:</strong> Random value for security</li>
                  <li><strong>code_challenge:</strong> PKCE code challenge</li>
                  <li><strong>code_challenge_method:</strong> "S256" for SHA256</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 4: Handle Authorization Response
              </h3>
              <p className="text-gray-600 mb-4">
                After the user authorizes your application, they'll be redirected back to your redirect URI.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Success Response:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`https://yourapp.com/callback?code=AUTHORIZATION_CODE&state=random_state_value`}
                </pre>
              </div>

              <div className="bg-red-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-red-900 mb-2">Error Response:</h4>
                <pre className="text-sm text-red-800 bg-red-100 p-3 rounded overflow-x-auto">
{`https://yourapp.com/callback?error=access_denied&error_description=User+denied+authorization&state=random_state_value`}
                </pre>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 5: Exchange Code for Access Token
              </h3>
              <p className="text-gray-600 mb-4">
                Exchange the authorization code for an access token.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Token Request:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`POST https://oz-mcp.vercel.app/api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=https%3A%2F%2Fyourapp.com%2Fcallback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&code_verifier=CODE_VERIFIER`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Token Response:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "access_token": "your_access_token_here",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                </pre>
              </div>
            </div>

            {/* Step 6 */}
            <div className="border-l-4 border-pink-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step 6: Use Access Token to Call API
              </h3>
              <p className="text-gray-600 mb-4">
                Use the access token to make authenticated requests to the MCP API.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">API Request:</h4>
                <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`POST https://oz-mcp.vercel.app/mcp/sse
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "check_opportunity_zone",
    "arguments": {
      "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Code Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                JavaScript/Node.js
              </h3>
              <pre className="text-sm text-gray-800 bg-gray-100 p-4 rounded overflow-x-auto">
{`const crypto = require('crypto');

class OZMCPClient {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.baseURL = 'https://oz-mcp.vercel.app';
  }

  generateAuthURL() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store these for later use
    this.codeVerifier = codeVerifier;
    this.state = state;
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'api:read',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    return \`\${this.baseURL}/oauth/authorize?\${params}\`;
  }

  async exchangeCodeForToken(code) {
    const response = await fetch(\`\${this.baseURL}/api/oauth/token\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: this.codeVerifier
      })
    });
    
    return await response.json();
  }

  async callAPI(accessToken, tool, params) {
    const response = await fetch(\`\${this.baseURL}/mcp/sse\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: tool,
          arguments: params
        }
      })
    });
    
    return await response.json();
  }
}

// Usage
const client = new OZMCPClient(
  'your_client_id',
  'your_client_secret',
  'https://yourapp.com/callback'
);

// Generate authorization URL
const authURL = client.generateAuthURL();
console.log('Visit:', authURL);

// After user authorizes and you get the code
const tokenResponse = await client.exchangeCodeForToken('authorization_code');
const accessToken = tokenResponse.access_token;

// Make API calls
const result = await client.callAPI(accessToken, 'check_opportunity_zone', {
  address: '1600 Pennsylvania Avenue NW, Washington, DC 20500'
});`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Python
              </h3>
              <pre className="text-sm text-gray-800 bg-gray-100 p-4 rounded overflow-x-auto">
{`import requests
import secrets
import hashlib
import base64
import urllib.parse

class OZMCPClient:
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.base_url = 'https://oz-mcp.vercel.app'
    
    def generate_auth_url(self):
        # Generate PKCE parameters
        code_verifier = base64.urlsafe_b64encode(
            secrets.token_bytes(32)
        ).decode('utf-8').rstrip('=')
        
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        state = secrets.token_hex(16)
        
        # Store for later use
        self.code_verifier = code_verifier
        self.state = state
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'api:read',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        return f"{self.base_url}/oauth/authorize?{urllib.parse.urlencode(params)}"
    
    def exchange_code_for_token(self, code):
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code_verifier': self.code_verifier
        }
        
        response = requests.post(
            f"{self.base_url}/api/oauth/token",
            data=data
        )
        
        return response.json()
    
    def call_api(self, access_token, tool, params):
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': tool,
                'arguments': params
            }
        }
        
        response = requests.post(
            f"{self.base_url}/mcp/sse",
            json=payload,
            headers=headers
        )
        
        return response.json()

# Usage
client = OZMCPClient(
    'your_client_id',
    'your_client_secret',
    'https://yourapp.com/callback'
)

# Generate authorization URL
auth_url = client.generate_auth_url()
print(f"Visit: {auth_url}")

# After user authorizes and you get the code
token_response = client.exchange_code_for_token('authorization_code')
access_token = token_response['access_token']

# Make API calls
result = client.call_api(access_token, 'check_opportunity_zone', {
    'address': '1600 Pennsylvania Avenue NW, Washington, DC 20500'
})`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Security Best Practices
          </h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">🔐 Always Use HTTPS</h3>
              <p className="text-sm text-yellow-800">
                Never use OAuth over HTTP in production. All redirect URIs must use HTTPS.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🛡️ Implement PKCE</h3>
              <p className="text-sm text-blue-800">
                Always use PKCE (Proof Key for Code Exchange) for enhanced security, especially for public clients.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">🔑 Validate State Parameter</h3>
              <p className="text-sm text-green-800">
                Always validate the state parameter to prevent CSRF attacks.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">⏰ Handle Token Expiration</h3>
              <p className="text-sm text-purple-800">
                Access tokens expire after 1 hour. Implement proper error handling and re-authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Troubleshooting
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Common Error: "Invalid client or redirect URI"</h3>
              <p className="text-sm text-gray-700 mb-2">
                This error occurs when the client ID doesn't exist or the redirect URI doesn't match.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verify your client ID is correct</li>
                <li>• Ensure the redirect URI exactly matches what's registered</li>
                <li>• Check for trailing slashes and URL encoding</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Common Error: "Invalid code"</h3>
              <p className="text-sm text-gray-700 mb-2">
                Authorization codes expire after 10 minutes and can only be used once.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Don't reuse authorization codes</li>
                <li>• Exchange codes for tokens immediately</li>
                <li>• Check that your redirect URI matches exactly</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Common Error: "Unauthorized" (401)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Your access token is invalid, expired, or not properly formatted.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check that you're including the "Bearer " prefix</li>
                <li>• Verify the token hasn't expired</li>
                <li>• Ensure the token is for the correct client</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}