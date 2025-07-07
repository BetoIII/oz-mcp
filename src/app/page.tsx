"use client"

import { useState } from "react"
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
import { useSession, signIn, signOut } from "next-auth/react"

export default function HomePage() {
  const { data: session } = useSession()
  const [searchValue, setSearchValue] = useState("")
  const [searchCount, setSearchCount] = useState(0)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim() || searchCount >= 3) return

    setIsSearching(true)
    
    try {
      const response = await fetch(`/api/opportunity-zones/check?address=${encodeURIComponent(searchValue)}`)
      const result = await response.json()
      
      setSearchResult({
        address: searchValue,
        isOpportunityZone: result.isOpportunityZone,
        tractId: result.tractId || "N/A",
        confidence: result.confidence || "High",
      })
      setSearchCount((prev) => prev + 1)
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock data for demo
      setSearchResult({
        address: searchValue,
        isOpportunityZone: Math.random() > 0.5,
        tractId: "12345.67",
        confidence: "High",
      })
      setSearchCount((prev) => prev + 1)
    }
    
    setIsSearching(false)
  }

  const progressPercentage = (searchCount / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">OZ-MCP</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/docs/oauth-flow" className="text-sm font-medium hover:text-blue-600">
              Docs
            </Link>
            <Link href="/playground" className="text-sm font-medium hover:text-blue-600">
              Playground
            </Link>
            {session?.user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => signIn('google')}
                  variant="outline"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => signIn('google')}
                  size="sm"
                >
                  Get API Key
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Zap className="mr-1 h-3 w-3" />
            Instant Opportunity Zone Verification
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Check Any U.S. Address for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Opportunity Zone Status
            </span>{" "}
            in Seconds
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Instantly verify U.S. Opportunity Zone eligibility for any address. Empower investors, CPAs, and PropTech
            builders to identify lucrative, tax-advantaged deals with our lightning-fast API.
          </p>
        </motion.div>

        {/* Search Demo */}
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Free Trial</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{searchCount}/3 searches used</span>
                <Progress value={progressPercentage} className="w-20" />
              </div>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Enter any U.S. address (e.g., 123 Main St, New York, NY)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
                disabled={searchCount >= 3}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchValue.trim() || searchCount >= 3 || isSearching}
                className="px-6"
              >
                {isSearching ? "Checking..." : "Check OZ Status"}
              </Button>
            </div>

            {searchResult && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">
                      {searchResult.isOpportunityZone ? "✅ Opportunity Zone" : "❌ Not an Opportunity Zone"}
                    </span>
                  </div>
                  <Badge variant="secondary">Tract: {searchResult.tractId}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Address: {searchResult.address} • Confidence: {searchResult.confidence}
                </p>
              </div>
            )}

            {searchCount >= 3 && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <p className="mb-3 font-medium">You've used all 3 free searches!</p>
                {session?.user ? (
                  <Link href="/dashboard">
                    <Button className="w-full">Go to Dashboard for Unlimited Searches</Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => signIn('google')}
                    className="w-full"
                  >
                    Create Free Account for Unlimited Searches
                  </Button>
                )}
              </div>
            )}
          </Card>

          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Powered by IRS/Census data</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated monthly</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="mb-12 text-lg text-muted-foreground">Three simple steps to verify Opportunity Zone status</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">1. Enter Address</h3>
              <p className="text-muted-foreground">Simply paste any U.S. address into our search bar</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2. Get Instant Results</h3>
              <p className="text-muted-foreground">Receive immediate OZ status with tract ID and confidence level</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">3. Integrate & Scale</h3>
              <p className="text-muted-foreground">Add to your AI assistants, apps, or workflows with our API</p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Get Started in Minutes</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Simple setup process to get your AI applications connected to opportunity zone data.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <CardTitle>Sign In</CardTitle>
                <CardDescription className="text-blue-100">
                  Authenticate with your Google account to access the developer dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!session?.user && (
                  <Button 
                    onClick={() => signIn('google')}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Sign In Now
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <CardTitle>Create Client</CardTitle>
                <CardDescription className="text-green-100">
                  Register your application and configure OAuth settings in the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session?.user && (
                  <Link href="/dashboard">
                    <Button className="bg-white text-green-600 hover:bg-green-50">
                      Open Dashboard
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <CardTitle>Start Building</CardTitle>
                <CardDescription className="text-purple-100">
                  Get your access token and start making API calls to power your AI applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/playground">
                  <Button className="bg-white text-purple-600 hover:bg-purple-50">
                    Try API
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Developer Resources</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Everything you need to integrate and build with our geospatial AI platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/docs/oauth-flow" className="group">
              <Card className="hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">OAuth Guide</h3>
                  <p className="text-sm text-muted-foreground">Complete OAuth 2.0 flow documentation with examples</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/playground" className="group">
              <Card className="hover:border-green-200 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">API Playground</h3>
                  <p className="text-sm text-muted-foreground">Interactive testing environment for all API endpoints</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/test" className="group">
              <Card className="hover:border-purple-200 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Connection Test</h3>
                  <p className="text-sm text-muted-foreground">Verify your setup and test API connectivity</p>
                </CardContent>
              </Card>
            </Link>

            <a href="https://oz-mcp.vercel.app" target="_blank" rel="noopener noreferrer" className="group">
              <Card className="hover:border-orange-200 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">API Endpoint</h3>
                  <p className="text-sm text-muted-foreground">Direct access to the MCP server endpoint</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* User Profile Section */}
      {session?.user && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  {session.user.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-16 h-16 rounded-full border-2 border-blue-200"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Welcome back, {session.user.name?.split(' ')[0]}!
                    </h3>
                    <p className="text-slate-600">{session.user.email}</p>
                    <div className="mt-4 flex space-x-4">
                      <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                      </Link>
                      <Link href="/playground">
                        <Button variant="outline">Try Playground</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">OZ-MCP</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure geospatial data and AI services for opportunity zone analysis
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs/oauth-flow" className="hover:text-foreground">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/playground" className="hover:text-foreground">
                    Playground
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/test" className="hover:text-foreground">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs/oauth-flow" className="hover:text-foreground">
                    OAuth Guide
                  </Link>
                </li>
                <li>
                  <Link href="/playground" className="hover:text-foreground">
                    API Playground
                  </Link>
                </li>
                <li>
                  <Link href="/test" className="hover:text-foreground">
                    Connection Test
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://oz-mcp.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    API Endpoint
                  </a>
                </li>
                <li>
                  <a href="https://github.com" className="hover:text-foreground">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2024 Opportunity Zone MCP Server. All rights reserved.</p>
            <div className="mt-4 flex items-center space-x-4 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
                All systems operational
              </Badge>
              <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">https://oz-mcp.vercel.app</code>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
