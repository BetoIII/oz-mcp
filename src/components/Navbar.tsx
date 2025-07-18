'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import {
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
  const [isRecognizedUser, setIsRecognizedUser] = useState(false)

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
    return <Image src="/oz-mcp-pin-icon.png" alt="OZ-MCP Logo" width={35} height={35} className="object-contain" />
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  // Check for previous login cookies on component mount
  useEffect(() => {
    const checkForPreviousLogin = () => {
      // Check for NextAuth session cookies that indicate previous login
      const cookies = document.cookie
      const hasSessionCookie = cookies.includes('next-auth.session-token') || 
                              cookies.includes('__Secure-next-auth.session-token') ||
                              cookies.includes('next-auth.csrf-token')
      
      setIsRecognizedUser(hasSessionCookie)
    }

    checkForPreviousLogin()
  }, [])

  const navLinks = [
    { href: '/docs', label: 'Docs', showAlways: true },
    { href: '/playground', label: 'Playground', showAlways: true },
    { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { href: 'https://x.com/BetoIII', label: 'Twitter', showAlways: true, external: true },
  ]

  const filteredNavLinks = navLinks.filter(link => {
    // Skip links that should only show on home page when not on default variant
    if ('showOnHome' in link && link.showOnHome && variant !== 'default') return false
    // Skip auth-required links when not authenticated
    if ('requiresAuth' in link && link.requiresAuth && status !== 'authenticated') return false
    // Show links that have showAlways, showOnHome, or requiresAuth properties
    if ('showAlways' in link && link.showAlways) return true
    if ('showOnHome' in link && link.showOnHome) return true
    if ('requiresAuth' in link && link.requiresAuth) return true
    return false
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            {getIcon()}
          </div>
          <span className="text-xl font-bold">{getTitle()}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {filteredNavLinks.map((link) => (
            'external' in link && link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            ) : status === 'authenticated' ? (
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={session.user?.image}
                  name={session.user?.name}
                  alt={session.user?.name || 'User'}
                />
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
              <Button
                variant="default"
                size="sm"
                onClick={handleSignIn}
              >
                {isRecognizedUser ? 'Sign In' : 'Get API Key'}
              </Button>
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
              'external' in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
            
            {/* Mobile Authentication */}
            <div className="pt-4 border-t">
              {status === 'loading' ? (
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
              ) : status === 'authenticated' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      src={session.user?.image}
                      name={session.user?.name}
                      alt={session.user?.name || 'User'}
                    />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignIn}
                  className="w-full"
                >
                  {isRecognizedUser ? 'Sign In' : 'Get API Key'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 