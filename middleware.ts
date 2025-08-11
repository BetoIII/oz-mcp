import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function resolveAllowedOrigin(request: NextRequest): string {
  const requestOrigin = request.headers.get('origin') || ''

  // Allow our site, localhost during development, and any chrome extension.
  const hardcodedAllowed = new Set<string>([
    'https://oz-mcp.vercel.app',
    'http://localhost:3000',
  ])

  // If the request is coming from a chrome extension, always allow.
  if (requestOrigin.startsWith('chrome-extension://')) {
    return requestOrigin
  }

  // If origin explicitly allowed, echo it back for better cacheability
  if (hardcodedAllowed.has(requestOrigin)) {
    return requestOrigin
  }

  // Fallback to wildcard (no credentials expected)
  return '*'
}

function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const allowedOrigin = resolveAllowedOrigin(request)
  const requestedHeaders = request.headers.get('access-control-request-headers')

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Vary', 'Origin')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    requestedHeaders || 'Content-Type, Authorization, X-OZ-Extension'
  )
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle CORS for all API routes centrally
  if (pathname.startsWith('/api/')) {
    // Respond immediately to preflight
    if (request.method === 'OPTIONS') {
      return applyCorsHeaders(request, new NextResponse(null, { status: 204 }))
    }
    // For actual API responses, ensure CORS headers are present
    const res = NextResponse.next()
    return applyCorsHeaders(request, res)
  }

  // Public route passthrough (kept for future auth expansion)
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