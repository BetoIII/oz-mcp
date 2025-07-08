'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  User,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react'

interface NavbarProps {
  variant?: 'default' | 'playground' | 'dashboard' | 'docs'
  title?: string
  icon?: React.ReactNode
}

export function Navbar({ variant = 'default', title, icon }: NavbarProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getTitle = () => {
    if (title) return title
    
    switch (variant) {
      case 'playground':
        return 'API Playground'
      case 'dashboard':
        return 'Dashboard'
      case 'docs':
        return 'Documentation'
      default:
        return 'OZ-MCP'
    }
  }

  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case 'playground':
        return <MapPin className="h-5 w-5 text-white" />
      case 'dashboard':
        return <Settings className="h-5 w-5 text-white" />
      case 'docs':
        return <MapPin className="h-5 w-5 text-white" />
      default:
        return <MapPin className="h-5 w-5 text-white" />
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const navLinks = [
    { href: '#pricing', label: 'Pricing', showOnHome: true },
    { href: '/docs/oauth-flow', label: 'Docs', showAlways: true },
    { href: '/playground', label: 'Playground', requiresAuth: true },
    { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  ]

  const filteredNavLinks = navLinks.filter(link => {
    if (link.showOnHome && variant !== 'default') return false
    if (link.requiresAuth && status !== 'authenticated') return false
    if (!link.showAlways && !link.showOnHome && !link.requiresAuth) return false
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            {getIcon()}
          </div>
          <span className="text-xl font-bold">{getTitle()}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : status === 'authenticated' ? (
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                )}
                <span className="text-sm text-gray-600 hidden lg:inline">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={handleSignIn}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Authentication */}
            <div className="pt-4 border-t">
              {status === 'loading' ? (
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
              ) : status === 'authenticated' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                    )}
                    <span className="text-sm text-gray-600">
                      {session.user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignIn}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSignIn}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 