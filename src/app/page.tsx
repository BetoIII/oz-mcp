"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Zap,
  Shield,
  Copy,
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
  Clock,
  DollarSign,
  Users,
  Bot,
  Play,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("")
  const [searchCount, setSearchCount] = useState(0)
  const [searchResult, setSearchResult] = useState<{
    address: string;
    isOpportunityZone: boolean;
    tractId: string;
    confidence?: string;
    queryTime?: string;
    method?: string;
    coordinates?: { lat: number; lon: number };
    error?: string;
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [lockoutInfo, setLockoutInfo] = useState<{
    isLocked: boolean;
    lockedUntil?: string;
    message?: string;
  }>({ isLocked: false })

  // Check search status on page load
  useEffect(() => {
    const checkSearchStatus = async () => {
      try {
        const response = await fetch('/api/opportunity-zones/validate-search')
        if (response.ok) {
          const data = await response.json()
          setSearchCount(data.searchCount)
          setLockoutInfo({
            isLocked: data.isLocked,
            lockedUntil: data.lockedUntil,
            message: data.isLocked ? 'You are locked out from free searches.' : undefined
          })
        }
      } catch (error) {
        console.error('Failed to check search status:', error)
      }
    }
    checkSearchStatus()
  }, [])

  // Function to parse MCP-style response text
  const parseOZResponse = (text: string) => {
    try {
      // Extract address and coordinates
      const addressMatch = text.match(/Address "([^"]+)" \(([^,]+), ([^)]+)\)/);
      if (!addressMatch) return null;

      const address = addressMatch[1];
      const lat = parseFloat(addressMatch[2]);
      const lon = parseFloat(addressMatch[3]);

      // Check if in opportunity zone
      const isInOZ = text.includes('is in an opportunity zone') && !text.includes('opportunity zone: null');
      
      // Extract zone ID
      let zoneId = null;
      if (isInOZ) {
        const zoneMatch = text.match(/Zone ID: (\d+)/);
        if (zoneMatch) {
          zoneId = zoneMatch[1];
        }
      }

      // Extract metadata
      const methodMatch = text.match(/method: (\w+)/);
      const dataVersionMatch = text.match(/Data version: ([^\n]+)/);

      return {
        address,
        isOpportunityZone: isInOZ,
        tractId: zoneId || "N/A",
        coordinates: { lat, lon },
        method: methodMatch?.[1] || "unknown",
        confidence: isInOZ ? "High" : "High", // Assume high confidence for parsed results
        queryTime: dataVersionMatch?.[1] ? new Date(dataVersionMatch[1]).toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim() || lockoutInfo.isLocked) return

    setIsSearching(true)
    setLockoutInfo(prev => ({ ...prev, message: undefined }))
    
    try {
      // First, validate the search attempt
      const validationResponse = await fetch('/api/opportunity-zones/validate-search', {
        method: 'POST'
      })
      
      const validationData = await validationResponse.json()
      
      if (!validationData.allowed) {
        setLockoutInfo({
          isLocked: validationData.reason === 'locked_out' || validationData.reason === 'limit_exceeded',
          lockedUntil: validationData.lockedUntil,
          message: validationData.message
        })
        setSearchCount(validationData.searchCount || searchCount)
        setIsSearching(false)
        return
      }

      // Update search count from validation
      setSearchCount(validationData.searchCount)

      // Proceed with the actual search
      // Use the MCP-style check with address parameter
      const ozResponse = await fetch(`/api/opportunity-zones/check?address=${encodeURIComponent(searchValue)}&format=mcp`)
      
      if (!ozResponse.ok) {
        throw new Error(`Opportunity zone check failed: ${ozResponse.status}`)
      }

      const ozData = await ozResponse.json()
      
      // Check if response has MCP format
      if (ozData.result?.content?.[0]?.text) {
        // Parse MCP response
        const parsed = parseOZResponse(ozData.result.content[0].text);
        if (parsed) {
          setSearchResult(parsed);
          setIsSearching(false);
          return;
        }
      }
      
      // Fallback: If not MCP format, try original API
      const geocodeResponse = await fetch('/api/opportunity-zones/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: searchValue }),
      })

      if (!geocodeResponse.ok) {
        throw new Error(`Geocoding failed: ${geocodeResponse.status}`)
      }

      const geocodeData = await geocodeResponse.json()
      
      const ozResponse2 = await fetch(`/api/opportunity-zones/check?lat=${geocodeData.latitude}&lon=${geocodeData.longitude}`)
      
      if (!ozResponse2.ok) {
        throw new Error(`Opportunity zone check failed: ${ozResponse2.status}`)
      }

      const ozData2 = await ozResponse2.json()
      
      setSearchResult({
        address: geocodeData.displayName || searchValue,
        isOpportunityZone: ozData2.isInOpportunityZone,
        tractId: ozData2.opportunityZoneId || "N/A",
        confidence: ozData2.performance?.info ? "High" : "Medium",
        queryTime: ozData2.metadata?.queryTime || "N/A",
        method: ozData2.metadata?.method || "unknown",
        coordinates: { lat: geocodeData.latitude, lon: geocodeData.longitude }
      })
      
    } catch (error) {
      console.error('Search error:', error)
      
      setSearchResult({
        address: searchValue,
        isOpportunityZone: false,
        tractId: "Error",
        confidence: "Error",
        error: error instanceof Error ? error.message : 'Search failed. Please try again.'
      })
    }
    
    setIsSearching(false)
  }

  const progressPercentage = (searchCount / 3) * 100
  const remainingSearches = Math.max(0, 3 - searchCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="default" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="mb-8 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Zap className="mr-1 h-3 w-3" />
            Instant Opportunity Zone Verification
          </Badge>
          <h1 className="mb-10 text-4xl font-bold tracking-tight sm:text-6xl">
            Check Any U.S. Address for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Opportunity Zone Eligibility
            </span>{" "}
            in Seconds
          </h1>
          <p className="mx-auto mb-16 max-w-2xl text-xl text-muted-foreground">
            Instantly verify Qualified Opportunity Zone (QOZ) eligibility for any U.S. address. Empowering investors, CPAs, and PropTech
            builders with our lightning-fast API.
          </p>
        </motion.div>

        {/* Search Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl"
        >
          <Card className="p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Free Trial</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {lockoutInfo.isLocked 
                    ? "Locked out" 
                    : `${searchCount}/3 searches used`
                  }
                </span>
                <Progress value={progressPercentage} className="w-20" />
              </div>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder={lockoutInfo.isLocked 
                  ? "Locked out - Create account for unlimited searches" 
                  : "Enter any U.S. address (e.g., 123 Main St, New York, NY)"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !lockoutInfo.isLocked && searchValue.trim() && !isSearching) {
                    handleSearch()
                  }
                }}
                className="flex-1"
                disabled={lockoutInfo.isLocked}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchValue.trim() || lockoutInfo.isLocked || isSearching}
                className="px-6"
              >
                {isSearching ? "Checking..." : "Search QOZs"}
              </Button>
            </div>

            {searchResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-lg border bg-muted/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {searchResult.error ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <span className="font-medium">
                      {searchResult.error 
                        ? searchResult.error
                        : searchResult.isOpportunityZone 
                          ? "✅ Opportunity Zone" 
                          : "❌ Not an Opportunity Zone"
                      }
                    </span>
                  </div>
                  {!searchResult.error && (
                    <Badge variant="secondary">Zone: {searchResult.tractId}</Badge>
                  )}
                </div>
                {!searchResult.error && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Address: {searchResult.address}
                    {searchResult.queryTime && ` • Query Time: ${searchResult.queryTime}`}
                    {searchResult.method && ` • Method: ${searchResult.method}`}
                  </p>
                )}
              </motion.div>
            )}

            {searchCount >= 3 && !lockoutInfo.isLocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center"
              >
                <p className="mb-3 font-medium">You've used all 3 free searches!</p>
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Create Free Account for Unlimited Searches</Link>
                </Button>
              </motion.div>
            )}

            {lockoutInfo.isLocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-center"
              >
                <p className="mb-3 font-medium">
                  {lockoutInfo.message || 'You are currently locked out from free searches.'}
                </p>
                {lockoutInfo.lockedUntil && (
                  <p className="text-sm text-muted-foreground">
                    Locked until: {new Date(lockoutInfo.lockedUntil).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            )}
          </Card>

          <div className="my-8 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Powered by IRS/Census data</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated monthly</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="mb-12 text-lg text-muted-foreground">Three simple steps to verify Opportunity Zone status</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">1. Enter Address</h3>
              <p className="text-muted-foreground">Simply paste any U.S. address into our search bar</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2. Get Instant Results</h3>
              <p className="text-muted-foreground">Receive immediate OZ status with tract ID and confidence level</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">3. Integrate & Scale</h3>
              <p className="text-muted-foreground">Add to your AI assistants, apps, or workflows with our API</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Assistant Integration */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Add to Your AI Assistant</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              One-click integration with Claude, ChatGPT, and other AI assistants
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="claude" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="claude">Claude</TabsTrigger>
                <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
              </TabsList>

              <TabsContent value="claude" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>Claude Desktop Integration</span>
                    </CardTitle>
                    <CardDescription>Add this to your claude_desktop_config.json file</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">{`{
  "mcpServers": {
    "Opportunity Zone MCP": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://oz-mcp.vercel.app/mcp/sse",
        "--header",
        "Authorization: Bearer YOUR_API_KEY"
      ]
    }
  }
}`}</pre>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Replace "YOUR_API_KEY" with your the API key generated from the Dashboard.
                    </p>
                    <Button className="mt-4 w-full" variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chatgpt" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>ChatGPT Integration</span>
                    </CardTitle>
                    <CardDescription>Use our OpenAI function schema for ChatGPT</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                      <p className="mb-2">{"{"}</p>
                      <p className="mb-2"> "name": "check_opportunity_zone",</p>
                      <p className="mb-2"> "description": "Check if a U.S. address is in an Opportunity Zone",</p>
                      <p className="mb-2"> "parameters": {"{"}</p>
                      <p className="mb-2"> "type": "object",</p>
                      <p className="mb-2"> "properties": {"{"}</p>
                      <p className="mb-2">
                        {" "}
                        "address": {"{"} "type": "string" {"}"}
                      </p>
                      <p className="mb-2"> {"}"}</p>
                      <p className="mb-2"> {"}"}</p>
                      <p>{"}"}</p>
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Function Schema
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Simple, usage-based pricing</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out the service</CardDescription>
                <div className="text-3xl font-bold">
                  $0<span className="text-lg font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>15 lookups/month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>No card required</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>API documentation</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-blue-200 shadow-lg">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600">Most Popular</Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For active investors and professionals</CardDescription>
                <div className="text-3xl font-bold">
                  $9<span className="text-lg font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>500 lookups/month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Usage analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Webhook notifications</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Scale</CardTitle>
                <CardDescription>For high-volume applications</CardDescription>
                <div className="text-3xl font-bold">
                  $49<span className="text-lg font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>5,000 lookups/month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Webhook notifications</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard">Upgrade to Scale</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground">
              Need higher volume or custom features? <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">Contact us for Enterprise pricing</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose OZ-MCP?</h2>
            <p className="mb-12 text-lg text-muted-foreground">Built for speed, accuracy, and scalability.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Sub-second response times with our optimized PostGIS database</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold">99.9% Accurate</h3>
              <p className="text-sm text-muted-foreground">Based on official IRS and Census Bureau data sources</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold">AI-Ready</h3>
              <p className="text-sm text-muted-foreground">Built for seamless integration with AI assistants and chatbots</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 font-semibold">Developer Friendly</h3>
              <p className="text-sm text-muted-foreground">RESTful API with comprehensive docs and SDKs</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-12 text-3xl font-bold">Trusted by Investors & Real Estate Professionals</h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "OZ-MCP has real value for our deal screening process. What used to take hours now takes seconds. And the Claude
                  integration is seamless."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Richard M.</p>
                    <p className="text-sm text-muted-foreground">Commercial Real Estate Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "As a CPA, I need reliable data for my clients. OZ-MCP's IRS-backed results give me the confidence to
                  make recommendations."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">CPA, Tax Advisory Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Screening Deals?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join investors and professionals using OZ-MCP to identify tax-advantaged opportunities.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/playground">
                Get Free API Key
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
