import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface SearchTracker {
  searchCount: number
  firstSearchDate: string
  lockedUntil?: string
}

const FREE_SEARCH_LIMIT = 3
const LOCKOUT_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 1 week
const COOKIE_NAME = 'oz_search_tracker'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const existingCookie = cookieStore.get(COOKIE_NAME)
    
    let tracker: SearchTracker
    const now = new Date()
    
    if (existingCookie) {
      try {
        tracker = JSON.parse(existingCookie.value)
        
        // Check if user is currently locked out
        if (tracker.lockedUntil) {
          const lockoutEnd = new Date(tracker.lockedUntil)
          if (now < lockoutEnd) {
            return NextResponse.json({
              allowed: false,
              reason: 'locked_out',
              message: 'Free trial searches are locked. Please create an account for unlimited searches.',
              lockedUntil: tracker.lockedUntil,
              searchCount: tracker.searchCount
            }, { status: 429 })
          } else {
            // Lockout period has ended, reset the tracker
            tracker = {
              searchCount: 0,
              firstSearchDate: now.toISOString()
            }
          }
        }
        
        // Check if it's been more than a week since first search (rolling window)
        const firstSearch = new Date(tracker.firstSearchDate)
        const weekFromFirstSearch = new Date(firstSearch.getTime() + LOCKOUT_DURATION_MS)
        
        if (now > weekFromFirstSearch) {
          // Reset tracker for new week
          tracker = {
            searchCount: 0,
            firstSearchDate: now.toISOString()
          }
        }
        
      } catch (error) {
        // Invalid cookie, start fresh
        tracker = {
          searchCount: 0,
          firstSearchDate: now.toISOString()
        }
      }
    } else {
      // First time user
      tracker = {
        searchCount: 0,
        firstSearchDate: now.toISOString()
      }
    }
    
    // Check if user has reached the limit
    if (tracker.searchCount >= FREE_SEARCH_LIMIT) {
      // Lock them out for a week from now
      const lockoutEnd = new Date(now.getTime() + LOCKOUT_DURATION_MS)
      tracker.lockedUntil = lockoutEnd.toISOString()
      
      const response = NextResponse.json({
        allowed: false,
        reason: 'limit_exceeded',
        message: 'You\'ve used all 3 free searches. Create an account for unlimited searches.',
        lockedUntil: tracker.lockedUntil,
        searchCount: tracker.searchCount
      }, { status: 429 })
      
      // Set the updated cookie
      response.cookies.set(COOKIE_NAME, JSON.stringify(tracker), {
        maxAge: LOCKOUT_DURATION_MS / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
      
      return response
    }
    
    // Allow the search and increment counter
    tracker.searchCount += 1
    
    const response = NextResponse.json({
      allowed: true,
      searchCount: tracker.searchCount,
      remainingSearches: FREE_SEARCH_LIMIT - tracker.searchCount,
      message: tracker.searchCount === FREE_SEARCH_LIMIT 
        ? 'This is your last free search. Create an account for unlimited searches.'
        : `${FREE_SEARCH_LIMIT - tracker.searchCount} free searches remaining.`
    })
    
    // Set the updated cookie
    response.cookies.set(COOKIE_NAME, JSON.stringify(tracker), {
      maxAge: LOCKOUT_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Search validation error:', error)
    return NextResponse.json({
      allowed: false,
      reason: 'error',
      message: 'Unable to validate search. Please try again.'
    }, { status: 500 })
  }
}

// GET endpoint to check current status without incrementing
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const existingCookie = cookieStore.get(COOKIE_NAME)
    
    if (!existingCookie) {
      return NextResponse.json({
        searchCount: 0,
        remainingSearches: FREE_SEARCH_LIMIT,
        isLocked: false
      })
    }
    
    const tracker: SearchTracker = JSON.parse(existingCookie.value)
    const now = new Date()
    
    // Check if locked out
    if (tracker.lockedUntil) {
      const lockoutEnd = new Date(tracker.lockedUntil)
      if (now < lockoutEnd) {
        return NextResponse.json({
          searchCount: tracker.searchCount,
          remainingSearches: 0,
          isLocked: true,
          lockedUntil: tracker.lockedUntil
        })
      }
    }
    
    // Check if week has passed (rolling window)
    const firstSearch = new Date(tracker.firstSearchDate)
    const weekFromFirstSearch = new Date(firstSearch.getTime() + LOCKOUT_DURATION_MS)
    
    if (now > weekFromFirstSearch) {
      return NextResponse.json({
        searchCount: 0,
        remainingSearches: FREE_SEARCH_LIMIT,
        isLocked: false
      })
    }
    
    return NextResponse.json({
      searchCount: tracker.searchCount,
      remainingSearches: Math.max(0, FREE_SEARCH_LIMIT - tracker.searchCount),
      isLocked: tracker.searchCount >= FREE_SEARCH_LIMIT
    })
    
  } catch (error) {
    console.error('Search status check error:', error)
    return NextResponse.json({
      searchCount: 0,
      remainingSearches: FREE_SEARCH_LIMIT,
      isLocked: false
    })
  }
} 