import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'oz_search_tracker'

export async function POST(request: NextRequest) {
  // Only allow this in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      error: 'Reset endpoint only available in development mode'
    }, { status: 403 })
  }

  try {
    const cookieStore = await cookies()
    
    // Create response and clear the tracking cookie
    const response = NextResponse.json({
      success: true,
      message: 'Rate limit reset successfully',
      searchCount: 0,
      isLocked: false
    })
    
    // Clear the cookie by setting it to expire immediately
    response.cookies.set(COOKIE_NAME, '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Error resetting rate limit:', error)
    return NextResponse.json({
      error: 'Failed to reset rate limit',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 