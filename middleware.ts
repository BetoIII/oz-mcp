import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow unauthenticated access to these routes
  const publicRoutes = [
    '/',
    '/playground',
    '/docs',
    '/api/opportunity-zones',
    '/api/temporary-key',
    '/api/mcp',
    '/oauth/authorize',
    '/oauth/callback',
    '/callback',
    '/auth'
  ]

  // Check if the current path starts with any public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes like /dashboard, you could add auth checks here
  // But for now, we'll allow all routes to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 