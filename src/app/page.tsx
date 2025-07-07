'use client';

import { auth, signIn, signOut } from "./auth";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Session {
  user?: User;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<'monthly' | 'annual'>('monthly');

  // Load session and search count
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
    
    const savedCount = localStorage.getItem('freeSearchCount');
    if (savedCount) {
      setSearchCount(parseInt(savedCount));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    if (!session && searchCount >= 3) {
      setShowModal(true);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSearchResults({
        address: searchQuery,
        isInOpportunityZone: Math.random() > 0.5,
        tract: `${Math.floor(Math.random() * 90000) + 10000}`,
        county: 'Sample County',
        state: 'Sample State'
      });

      if (!session) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('freeSearchCount', newCount.toString());
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const aiAssistantPrompt = `You are an Opportunity Zone assistant. Use the OZ-MCP API to check if addresses are in opportunity zones. Here's how to integrate:

1. Add this MCP server to your configuration:
   - Server URL: https://oz-mcp.vercel.app/mcp/sse
   - Authentication: OAuth 2.0 Bearer token

2. Available tools:
   - check_opportunity_zone: Check if an address is in an OZ
   - geocode_address: Convert address to coordinates
   - get_oz_status: Check service status

Example usage:
"Check if 1600 Pennsylvania Avenue NW, Washington, DC is in an opportunity zone"`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sticky Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">OZ</span>
              </div>
              <span className="text-xl font-bold text-slate-900">OZ-MCP</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/docs" className="text-slate-600 hover:text-blue-600 transition-colors">
                Docs
              </Link>
              <Link href="/playground" className="text-slate-600 hover:text-blue-600 transition-colors">
                Playground
              </Link>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">
                Pricing
              </a>
              {session?.user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <form action={async () => { await signOut(); }}>
                    <button 
                      type="submit"
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <form action={async () => { await signIn('google'); }}>
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Get Free API Key
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </nav>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="py-24 text-center relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl font-bold text-slate-900 mb-6">
                Check Any US Address for{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Opportunity Zone
                </span>
                {' '}Status in Seconds
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-4xl mx-auto">
                OZ-MCP instantly verifies U.S. Opportunity Zone status for any address, empowering investors, CPAs, and PropTech builders to identify lucrative, tax-advantaged deals.
              </p>

              {/* Free Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Try it free:</span>
                    {!session && (
                      <motion.div 
                        key={searchCount}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {searchCount}/3 free searches used
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter any US address (e.g., 1600 Pennsylvania Ave NW, Washington, DC)"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSearch}
                      disabled={isSearching || (!session && searchCount >= 3)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Checking...' : 'Check OZ Status'}
                    </motion.button>
                  </div>

                  {/* Search Results */}
                  <AnimatePresence>
                    {searchResults && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-4 h-4 rounded-full ${searchResults.isInOpportunityZone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-semibold text-slate-900">
                            {searchResults.isInOpportunityZone ? '✅ In Opportunity Zone' : '❌ Not in Opportunity Zone'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p><strong>Address:</strong> {searchResults.address}</p>
                          <p><strong>Census Tract:</strong> {searchResults.tract}</p>
                          <p><strong>County:</strong> {searchResults.county}, {searchResults.state}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress Bar */}
                  {!session && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Free searches</span>
                        <span>{searchCount}/3</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(searchCount / 3) * 100}%` }}
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Powered by IRS/Census data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>OAuth 2.0 Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>AI Assistant Ready</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">How It Works</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Three simple steps to start identifying opportunity zone deals instantly
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Sign Up Free",
                  description: "Create your account with Google OAuth in seconds. Get instant access to 1,000 free monthly searches.",
                  icon: "👤"
                },
                {
                  step: "2", 
                  title: "Get API Key",
                  description: "Receive your API key immediately after signup. No waiting, no manual approval process.",
                  icon: "🔑"
                },
                {
                  step: "3",
                  title: "Start Checking",
                  description: "Use our API directly or integrate with Claude, ChatGPT, and other AI assistants instantly.",
                  icon: "🚀"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    {item.icon}
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Assistant Integration Section */}
        <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Add to Your AI Assistant</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                One-click integration with Claude, ChatGPT, and other AI assistants. Copy the prompt below and paste it into your AI tool.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">AI Assistant Prompt</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(aiAssistantPrompt)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Copy Prompt
                </motion.button>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 font-mono text-sm text-slate-700 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{aiAssistantPrompt}</pre>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    C
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Claude Integration</h4>
                    <p className="text-sm text-slate-600">Add as MCP server in Claude Desktop</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    G
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">ChatGPT Integration</h4>
                    <p className="text-sm text-slate-600">Use as custom action or function</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Simple, Transparent Pricing</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                Start free, scale as you grow. No hidden fees, no surprises.
              </p>
              
              {/* Pricing Toggle */}
              <div className="flex items-center justify-center mb-12">
                <span className={`mr-3 ${selectedPricing === 'monthly' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>Monthly</span>
                <motion.button
                  onClick={() => setSelectedPricing(selectedPricing === 'monthly' ? 'annual' : 'monthly')}
                  className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <motion.div
                    animate={{ x: selectedPricing === 'annual' ? 28 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </motion.button>
                <span className={`ml-3 ${selectedPricing === 'annual' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  Annual <span className="text-green-600 text-sm">(Save 20%)</span>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Free",
                  price: "$0",
                  period: "forever",
                  description: "Perfect for trying out the service",
                  features: [
                    "1,000 requests/month",
                    "Basic API access",
                    "Community support",
                    "Standard rate limits"
                  ],
                  cta: "Start Free",
                  popular: false
                },
                {
                  name: "Pro",
                  price: selectedPricing === 'monthly' ? "$29" : "$24",
                  period: selectedPricing === 'monthly' ? "/month" : "/month",
                  description: "For growing businesses and active investors",
                  features: [
                    "25,000 requests/month",
                    "Priority API access",
                    "Email support",
                    "Higher rate limits",
                    "Webhook notifications"
                  ],
                  cta: "Upgrade to Pro",
                  popular: true
                },
                {
                  name: "Scale",
                  price: selectedPricing === 'monthly' ? "$99" : "$79",
                  period: selectedPricing === 'monthly' ? "/month" : "/month", 
                  description: "For high-volume applications and enterprises",
                  features: [
                    "100,000 requests/month",
                    "Dedicated support",
                    "Custom integrations",
                    "SLA guarantee",
                    "Priority feature requests"
                  ],
                  cta: "Contact Sales",
                  popular: false
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                    plan.popular ? 'border-blue-500' : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-1">
                      {plan.price}
                      <span className="text-lg font-normal text-slate-500">{plan.period}</span>
                    </div>
                    <p className="text-slate-600">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Trusted by Investors & Developers</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                See how professionals are using OZ-MCP to accelerate their opportunity zone investments
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "OZ-MCP saved me hours of manual research. What used to take me a full day now takes seconds. The AI integration is game-changing.",
                  author: "Sarah Chen",
                  role: "Real Estate Investor",
                  company: "Pacific Properties"
                },
                {
                  quote: "As a CPA, I need reliable data for my clients. OZ-MCP's IRS-backed data gives me confidence in my recommendations.",
                  author: "Michael Rodriguez", 
                  role: "Tax Advisor",
                  company: "Rodriguez & Associates"
                },
                {
                  quote: "The API integration was seamless. Our PropTech platform now automatically flags OZ properties for our investor clients.",
                  author: "David Kim",
                  role: "CTO",
                  company: "InvestFlow"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <svg className="w-8 h-8 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                  </div>
                  <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Accelerate Your Opportunity Zone Investments?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of investors, CPAs, and developers who trust OZ-MCP for instant opportunity zone verification.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {!session?.user ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <form action={async () => { await signIn('google'); }}>
                      <button 
                        type="submit"
                        className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg"
                      >
                        Start Free - Get 1,000 Monthly Searches
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/dashboard" 
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg inline-block"
                    >
                      Go to Dashboard
                    </Link>
                  </motion.div>
                )}
                
                <Link 
                  href="/docs" 
                  className="text-white border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
                >
                  View Documentation
                </Link>
              </div>
              
              <p className="text-blue-200 text-sm mt-6">
                No credit card required • Setup in under 5 minutes • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">OZ</span>
                </div>
                <span className="text-2xl font-bold">OZ-MCP</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                The fastest way to verify Opportunity Zone status for any US address. Trusted by investors, CPAs, and developers worldwide.
              </p>
              <div className="bg-slate-800 rounded-lg px-4 py-2 inline-block">
                <code className="text-slate-300 text-sm">https://oz-mcp.vercel.app</code>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/playground" className="hover:text-white transition-colors">API Playground</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 OZ-MCP. All rights reserved. Data powered by IRS and U.S. Census Bureau.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free searches used up!</h3>
                <p className="text-slate-600">Create a free account to unlock unlimited searches</p>
              </div>
              
              <div className="space-y-4">
                <form action={async () => { await signIn('google'); }}>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign Up Free with Google
                  </button>
                </form>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Maybe later
                </button>
              </div>
              
              <div className="mt-6 text-center text-xs text-slate-500">
                No credit card required • 1,000 free searches/month
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
