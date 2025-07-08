import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Book, 
  Shield, 
  Key, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Code,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Footer } from "@/components/Footer"

export default function OAuthFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Book className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">OAuth Documentation</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/playground" className="text-sm font-medium hover:text-blue-600">
              Playground
            </Link>
            <Link href="/">
              <Button size="sm">Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">OAuth 2.0 Flow</h1>
                <p className="text-gray-600 mt-1">
                  Complete guide to implementing OAuth 2.0 authentication with the MCP server
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The Opportunity Zone MCP server uses OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) 
                for secure authentication. This flow is designed to work with both confidential and public clients.
              </p>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>What you'll need:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• A registered OAuth client (created in the dashboard)</li>
                    <li>• A redirect URI where users will be sent after authorization</li>
                    <li>• Your application's client ID and secret</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step-by-Step Implementation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Step-by-Step Implementation</CardTitle>
              <CardDescription>
                Follow these steps to integrate OAuth 2.0 authentication in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-700">Step 1</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Register Your Application
                  </h3>
                </div>
                <p className="text-gray-600">
                  First, you need to register your application in the developer dashboard.
                </p>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">Manual Registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Sign in to the <Link href="/dashboard" className="text-blue-600 hover:underline">dashboard</Link></li>
                      <li>2. Click "Create New Client"</li>
                      <li>3. Enter your application name</li>
                      <li>4. Add your redirect URIs (one per line)</li>
                      <li>5. Save your client ID and secret</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>API Registration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">Step 2</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generate PKCE Parameters (Recommended)
                  </h3>
                </div>
                <p className="text-gray-600">
                  For enhanced security, especially for public clients, generate PKCE parameters.
                </p>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>JavaScript Example</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-700">Step 3</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Redirect User to Authorization Server
                  </h3>
                </div>
                <p className="text-gray-600">
                  Redirect the user to the authorization endpoint with the required parameters.
                </p>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base">Authorization URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`https://oz-mcp.vercel.app/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fyourapp.com%2Fcallback&response_type=code&scope=api%3Aread&state=random_state_value&code_challenge=CODE_CHALLENGE&code_challenge_method=S256`}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Parameters</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>client_id:</strong> Your application's client ID</div>
                      <div><strong>redirect_uri:</strong> Where to redirect after authorization</div>
                      <div><strong>response_type:</strong> Must be "code"</div>
                      <div><strong>scope:</strong> Requested permissions (e.g., "api:read")</div>
                      <div><strong>state:</strong> Random value for security</div>
                      <div><strong>code_challenge:</strong> PKCE code challenge</div>
                      <div><strong>code_challenge_method:</strong> "S256" for SHA256</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-700">Step 4</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Handle Authorization Response
                  </h3>
                </div>
                <p className="text-gray-600">
                  After the user authorizes your application, they'll be redirected back to your redirect URI.
                </p>
                
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Success Response</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
{`https://yourapp.com/callback?code=AUTHORIZATION_CODE&state=random_state_value`}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Error Response</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-red-800 bg-red-100 p-3 rounded overflow-x-auto">
{`https://yourapp.com/callback?error=access_denied&error_description=User+denied+authorization&state=random_state_value`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Step 5 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-indigo-100 text-indigo-700">Step 5</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Exchange Code for Access Token
                  </h3>
                </div>
                <p className="text-gray-600">
                  Exchange the authorization code for an access token.
                </p>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Token Request</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>Token Response</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "access_token": "your_access_token_here",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Step 6 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-pink-100 text-pink-700">Step 6</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Use Access Token
                  </h3>
                </div>
                <p className="text-gray-600">
                  Use the access token to make authenticated requests to the MCP server.
                </p>
                
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Authenticated Request</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-800 bg-gray-100 p-3 rounded overflow-x-auto">
{`POST https://oz-mcp.vercel.app/api/mcp
Authorization: Bearer your_access_token_here
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "check_opportunity_zone",
    "arguments": {
      "latitude": "38.8977",
      "longitude": "-77.0365"
    }
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Quick Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Developer Dashboard
                  </Button>
                </Link>
                <Link href="/playground">
                  <Button variant="outline" className="w-full justify-start">
                    <Code className="h-4 w-4 mr-2" />
                    API Playground
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}