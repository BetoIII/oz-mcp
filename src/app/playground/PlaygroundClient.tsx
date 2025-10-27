'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Play, 
  RefreshCw, 
  Key, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Shield,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

interface ApiResponse {
  jsonrpc?: string;
  id?: number;
  result?: {
    content?: Array<{
      type: string;
      text: string;
    }>;
    addressNotFound?: boolean;
  };
  error?: string;
}

interface ParsedOZResult {
  address: string;
  isOpportunityZone: boolean;
  zoneId: string | null;
  coordinates: { lat: number; lon: number } | null;
  dataVersion?: string;
  lastUpdated?: string;
  featureCount?: number;
  method?: string;
}

export default function PlaygroundClient() {
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

  // Temporary API key state
  const [isCreatingTempKey, setIsCreatingTempKey] = useState<boolean>(false);
  const [tempKeyInfo, setTempKeyInfo] = useState<{ usageCount?: number; isTemporary?: boolean } | null>(null);

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
      // Check if it's a temporary token
      if (storedToken.startsWith('temp_')) {
        setTempKeyInfo({ isTemporary: true, usageCount: 0 });
      }
    }
  }, []);

  // Function to create temporary API key
  const createTemporaryApiKey = async () => {
    setIsCreatingTempKey(true);
    setError('');

    try {
      const response = await fetch('/api/temporary-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAccessToken(result.token);
        localStorage.setItem('oauth_access_token', result.token);
        setTempKeyInfo({ usageCount: 0, isTemporary: true });
        setError('');
      } else {
        setError(result.message || 'Failed to create temporary API key');
      }
    } catch (error) {
      setError('Network error creating temporary API key');
      console.error('Error creating temporary API key:', error);
    } finally {
      setIsCreatingTempKey(false);
    }
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

  // Auto-check service status when access token becomes available
  useEffect(() => {
    if (accessToken) {
      // Check status with a small delay to allow UI to render
      const timer = setTimeout(() => {
        checkServiceStatus();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [accessToken]);

  // Auto-refresh status when access token is available
  useEffect(() => {
    if (accessToken && autoRefreshStatus) {
      const interval = setInterval(checkServiceStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [accessToken, autoRefreshStatus]);



  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
    setResponse(null);
    setError('');
  };

  const handleParamChange = (key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Function to parse MCP response text
  const parseOZResponse = (text: string): ParsedOZResult | null => {
    try {
      // Extract address and coordinates
      const addressMatch = text.match(/Address "([^"]+)" \(([^,]+), ([^)]+)\)/);
      if (!addressMatch) return null;

      const address = addressMatch[1];
      const lat = parseFloat(addressMatch[2]);
      const lon = parseFloat(addressMatch[3]);

      // Check if in opportunity zone - simplified logic with consistent messaging
      const isInOZ = text.includes('is in an opportunity zone') && !text.includes('is not in an opportunity zone');
      
      // Extract zone ID
      let zoneId = null;
      if (isInOZ) {
        const zoneMatch = text.match(/Zone ID: (\d+)/);
        if (zoneMatch) {
          zoneId = zoneMatch[1];
        }
      }

      // Extract metadata
      const dataVersionMatch = text.match(/Data version: ([^\n]+)/);
      const lastUpdatedMatch = text.match(/Last updated: ([^\n]+)/);
      const featureCountMatch = text.match(/Feature count: (\d+)/);
      const methodMatch = text.match(/method: (\w+)/);

      return {
        address,
        isOpportunityZone: isInOZ,
        zoneId,
        coordinates: { lat, lon },
        dataVersion: dataVersionMatch?.[1],
        lastUpdated: lastUpdatedMatch?.[1],
        featureCount: featureCountMatch ? parseInt(featureCountMatch[1]) : undefined,
        method: methodMatch?.[1]
      };
    } catch (error) {
      console.error('Error parsing OZ response:', error);
      return null;
    }
  };

  const executeRequest = async () => {
    if (!accessToken) {
      setError('No access token available. Please authenticate first.');
      return;
    }

    if (!selectedTool) {
      setError('Please select a tool to execute.');
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

      const result = await response.json();
      setResponse(result);

      if (!response.ok) {
        // Handle temporary key limit exceeded
        if (response.status === 429 && result.code === 'TEMP_KEY_LIMIT_EXCEEDED') {
          setTempKeyInfo(prev => prev ? { ...prev, usageCount: 5 } : null);
          setError('Temporary API key limit exceeded. Create a new temporary key (POST /api/temporary-key or use the Create Temporary API Key button) or sign up at the dashboard for higher limits.');
        } else {
          setError(`HTTP ${response.status}: ${result.error?.message || 'Unknown error'}`);
        }
      } else {
        // Check if the response indicates an address not found error
        const isAddressNotFound = result.result?.addressNotFound || 
          (result.result?.content?.[0]?.text?.includes('Address not found'));
        
        // Only increment usage count if:
        // 1. We have a temporary key AND
        // 2. The address was found (successful operation)
        if (tempKeyInfo?.isTemporary && accessToken.startsWith('temp_') && !isAddressNotFound) {
          setTempKeyInfo(prev => prev ? { 
            ...prev, 
            usageCount: (prev.usageCount || 0) + 1 
          } : null);
        }

        // Set specific error for address not found
        if (isAddressNotFound) {
          setError('Address not found. Please check your address format and try again. Make sure to include city and state for U.S. addresses.');
        }
      }
    } catch (error) {
      setError(`Request failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tools = {
    check_opportunity_zone: {
      name: 'Check Opportunity Zone',
      description: 'Check if coordinates or an address is in an opportunity zone',
      parameters: {
        address: 'Address to check (alternative to coordinates)',
        latitude: 'Latitude (alternative to address)',
        longitude: 'Longitude (alternative to address)',
      },
    },
    geocode_address: {
      name: 'Geocode Address',
      description: 'Convert an address to coordinates',
      parameters: {
        address: 'Address to geocode',
      },
    },
    grok_address: {
      name: 'Grok Address (Multimodal)',
      description: 'Extract address from screenshot, HTML, URL, or metadata using AI',
      parameters: {
        screenshot: 'Base64-encoded screenshot (PNG/JPEG)',
        html: 'HTML content',
        url: 'Page URL',
        metadata: 'Structured metadata (JSON)',
        strictValidation: 'Require high confidence (default: true)',
      },
    },
    get_oz_status: {
      name: 'Get Service Status',
      description: 'Get opportunity zone service status and cache information',
      parameters: {},
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="playground" />

      <div className="container mx-auto px-4 py-8">
        {/* Service Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Service Status</span>
              <Button
                size="sm"
                variant="outline"
                onClick={checkServiceStatus}
                disabled={!accessToken || serviceStatus.isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${serviceStatus.isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Monitor the MCP server initialization and data loading status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {serviceStatus.isInitialized ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">
                  {serviceStatus.isInitialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="text-sm">
                  {serviceStatus.featureCount || 0} Census tracts loaded
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <span className="text-sm">
                  {serviceStatus.lastUpdated || 'Never updated'}
                </span>
              </div>
            </div>
            {!accessToken && (
              <Badge variant="destructive" className="mt-4">
                No access token - authenticate to check status
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Authentication</span>
                </CardTitle>
                <CardDescription>
                  Manage your access token for API requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!accessToken ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Get started with the API playground
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                          onClick={createTemporaryApiKey}
                          disabled={isCreatingTempKey}
                        >
                          {isCreatingTempKey ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2" />
                              Create Temporary API Key
                            </>
                          )}
                        </Button>
                        <Link href="/dashboard">
                          <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Signup for Free API Key
                          </Button>
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Temporary keys allow 5 requests and expire in 24 hours
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        {tempKeyInfo?.isTemporary ? 'Temporary Key Active' : 'Authenticated'}
                      </span>
                    </div>
                    
                    {tempKeyInfo?.isTemporary && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Temporary API Key</span>
                        </div>
                        <div className="text-xs text-blue-700">
                          Usage: {tempKeyInfo.usageCount || 0}/5 requests • Expires in 24 hours
                        </div>
                        {(tempKeyInfo.usageCount || 0) >= 4 && (
                          <div className="text-xs text-orange-600 mt-1">
                            {(tempKeyInfo.usageCount || 0) === 4 ? 'Last request remaining!' : 'Consider signing up for unlimited access'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Access Token (masked)</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="access-token-display"
                          name="accessToken"
                          value={accessToken.substring(0, 8) + '...' + accessToken.substring(accessToken.length - 8)}
                          readOnly
                        />
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAccessToken('');
                            localStorage.removeItem('oauth_access_token');
                            setTempKeyInfo(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tool Selection and Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Tool Configuration</span>
                </CardTitle>
                <CardDescription>
                  Select and configure the MCP tool to execute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tool">Tool</Label>
                  <Select value={selectedTool} onValueChange={handleToolChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check_opportunity_zone">Check Opportunity Zone</SelectItem>
                      <SelectItem value="geocode_address">Geocode Address</SelectItem>
                      <SelectItem value="grok_address">Grok Address (Multimodal)</SelectItem>
                      <SelectItem value="get_oz_status">Get Service Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Tool-specific parameters */}
                {selectedTool === 'check_opportunity_zone' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="e.g., 123 Main St, New York, NY"
                        value={params.address}
                        onChange={(e) => handleParamChange('address', e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>OR</strong> provide coordinates:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          placeholder="e.g., 38.8977"
                          value={params.latitude}
                          onChange={(e) => handleParamChange('latitude', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          placeholder="e.g., -77.0365"
                          value={params.longitude}
                          onChange={(e) => handleParamChange('longitude', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedTool === 'geocode_address' && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., 123 Main St, New York, NY"
                      value={params.address}
                      onChange={(e) => handleParamChange('address', e.target.value)}
                    />
                  </div>
                )}

                {selectedTool === 'grok_address' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-blue-900">Multimodal Address Extraction</p>
                      <p className="text-blue-700 text-xs mt-1">
                        Provide one or more inputs. Multiple inputs improve accuracy.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="e.g., https://www.zillow.com/homedetails/..."
                        value={params.url}
                        onChange={(e) => handleParamChange('url', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="html">HTML Content (optional)</Label>
                      <Textarea
                        id="html"
                        placeholder="Paste HTML content here..."
                        value={params.html}
                        onChange={(e) => handleParamChange('html', e.target.value)}
                        className="min-h-[100px] font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="screenshot">Screenshot (Base64)</Label>
                      <Textarea
                        id="screenshot"
                        placeholder="Paste base64-encoded image (data:image/png;base64,...)"
                        value={params.screenshot}
                        onChange={(e) => handleParamChange('screenshot', e.target.value)}
                        className="min-h-[80px] font-mono text-xs"
                      />
                      <div className="text-xs text-muted-foreground">
                        Accepts PNG, JPEG, WEBP (base64 or data URL format)
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
                      <Textarea
                        id="metadata"
                        placeholder='{"address": {...}}'
                        value={params.metadata}
                        onChange={(e) => handleParamChange('metadata', e.target.value)}
                        className="min-h-[60px] font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {selectedTool === 'get_oz_status' && (
                  <div className="text-sm text-muted-foreground">
                    <p>This tool requires no parameters.</p>
                  </div>
                )}

                <Button 
                  onClick={executeRequest}
                  disabled={!accessToken || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Response Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  API response will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {error}
                    </AlertDescription>
                  </Alert>
                )}

                {response && (
                  <div className="space-y-4">
                    <Badge variant={response.error ? "destructive" : "default"}>
                      {response.error ? "Error" : "Success"}
                    </Badge>

                    {/* Parsed Result Display */}
                    {(selectedTool === 'check_opportunity_zone' || selectedTool === 'geocode_address' || selectedTool === 'get_listing_address') && response.result?.content?.[0]?.text && (
                      <div className="mb-4">
                        {(() => {
                          const responseText = response.result.content[0].text;
                          const isAddressNotFound = response.result?.addressNotFound || 
                            responseText.includes('Address not found') || 
                            responseText.includes('Error: Address not found');

                          // Handle address not found case
                          if (isAddressNotFound) {
                            return (
                              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                                  <span className="font-medium text-amber-800">⚠️ Address Not Found</span>
                                </div>
                                <div className="text-sm text-amber-700 space-y-2">
                                  <p className="bg-amber-50 p-2 rounded">
                                    Please check your address format and try again. Make sure to include city and state for U.S. addresses.
                                  </p>
                                  <div>
                                    <p className="font-medium text-muted-foreground mb-1">Try formats like:</p>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                      <li className="text-xs">123 Main Street, New York, NY</li>
                                      <li className="text-xs">456 Oak Avenue, Los Angeles, CA 90210</li>
                                      <li className="text-xs">789 Broadway, Chicago, IL</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Handle successful opportunity zone check
                          if (selectedTool === 'check_opportunity_zone') {
                            const parsed = parseOZResponse(responseText);
                            if (parsed) {
                              return (
                                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {parsed.isOpportunityZone ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      )}
                                      <span className="font-medium">
                                        {parsed.isOpportunityZone ? "✅ Opportunity Zone" : "❌ Not an Opportunity Zone"}
                                      </span>
                                    </div>
                                    {parsed.zoneId && (
                                      <Badge variant="secondary">Zone: {parsed.zoneId}</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Address:</strong> {parsed.address}</p>
                                    {parsed.coordinates && (
                                      <p><strong>Coordinates:</strong> {parsed.coordinates.lat}, {parsed.coordinates.lon}</p>
                                    )}
                                    {parsed.method && (
                                      <p><strong>Method:</strong> {parsed.method}</p>
                                    )}
                                    {parsed.featureCount && (
                                      <p><strong>Features:</strong> {parsed.featureCount.toLocaleString()}</p>
                                    )}
                                    {parsed.dataVersion && (
                                      <p><strong>Data Version:</strong> {new Date(parsed.dataVersion).toLocaleString()}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          // Handle successful geocoding
                          if (selectedTool === 'geocode_address') {
                            const addressMatch = responseText.match(/Address: ([^\n]+)/);
                            const coordMatch = responseText.match(/Coordinates: ([^,]+), ([^\n]+)/);
                            const displayMatch = responseText.match(/Display name: ([^\n]+)/);
                            
                            if (addressMatch && coordMatch) {
                              return (
                                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">✅ Address Geocoded</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Address:</strong> {addressMatch[1]}</p>
                                    <p><strong>Coordinates:</strong> {coordMatch[1]}, {coordMatch[2]}</p>
                                    {displayMatch && (
                                      <p><strong>Display Name:</strong> {displayMatch[1]}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          // Handle grok_address extraction
                          if (selectedTool === 'grok_address') {
                            const successMatch = responseText.match(/✅ Address extracted successfully/);
                            const failureMatch = responseText.match(/❌ Address extraction failed/);
                            const addressMatch = responseText.match(/\*\*([^*]+)\*\*/);
                            const confidenceMatch = responseText.match(/Confidence: ([\d.]+)%/);
                            const sourcesMatch = responseText.match(/Sources: ([^\n]+)/);

                            if (successMatch && addressMatch) {
                              return (
                                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">✅ Address Extracted Successfully</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="text-lg font-semibold text-foreground">{addressMatch[1]}</p>
                                    {confidenceMatch && (
                                      <p><strong>Confidence:</strong> {confidenceMatch[1]}%</p>
                                    )}
                                    {sourcesMatch && (
                                      <p><strong>Sources:</strong> {sourcesMatch[1]}</p>
                                    )}
                                  </div>
                                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                    💡 Tip: Use this address with "Check Opportunity Zone" to verify OZ status
                                  </div>
                                </div>
                              );
                            } else if (failureMatch) {
                              const candidateMatch = responseText.match(/Candidate: ([^\n]+)/);
                              return (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <span className="font-medium text-amber-800">Address Extraction Failed</span>
                                  </div>
                                  {candidateMatch && (
                                    <div className="text-sm text-amber-700">
                                      <p><strong>Candidate found:</strong> {candidateMatch[1]}</p>
                                      {confidenceMatch && (
                                        <p><strong>Confidence:</strong> {confidenceMatch[1]}% (below 80% threshold)</p>
                                      )}
                                    </div>
                                  )}
                                  <div className="text-xs text-amber-700">
                                    Try providing multiple inputs (screenshot + HTML) for better results
                                  </div>
                                </div>
                              );
                            }
                          }

                          return null;
                        })()}
                      </div>
                    )}

                    <Textarea
                      value={JSON.stringify(response, null, 2)}
                      readOnly
                      className="min-h-[400px] font-mono text-xs"
                    />
                  </div>
                )}

                {!response && !error && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Execute a request to see the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 