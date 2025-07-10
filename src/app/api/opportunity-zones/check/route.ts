import { NextRequest, NextResponse } from 'next/server'
import { OpportunityZoneService } from '@/lib/services/opportunity-zones'
import { geocodingService } from '@/lib/services/geocoding'
import { cookies } from 'next/headers'

interface SearchTracker {
  searchCount: number
  firstSearchDate: string
  lockedUntil?: string
}

const FREE_SEARCH_LIMIT = 3
const LOCKOUT_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 1 week
const COOKIE_NAME = 'oz_search_tracker'

// Function to validate search and increment counter only after successful geocoding
async function validateAndIncrementSearch() {
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
          return {
            allowed: false,
            reason: 'locked_out',
            message: 'Free trial searches are locked. Please create an account for unlimited searches.',
            lockedUntil: tracker.lockedUntil,
            searchCount: tracker.searchCount
          }
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
    
    return {
      allowed: false,
      reason: 'limit_exceeded',
      message: 'You\'ve used all 3 free searches. Create an account for unlimited searches.',
      lockedUntil: tracker.lockedUntil,
      searchCount: tracker.searchCount,
      tracker // Return tracker to save the lockout state
    }
  }
  
  // Allow the search and increment counter
  tracker.searchCount += 1
  
  return {
    allowed: true,
    searchCount: tracker.searchCount,
    remainingSearches: FREE_SEARCH_LIMIT - tracker.searchCount,
    message: tracker.searchCount === FREE_SEARCH_LIMIT 
      ? 'This is your last free search. Create an account for unlimited searches.'
      : `${FREE_SEARCH_LIMIT - tracker.searchCount} free searches remaining.`,
    tracker // Return updated tracker to save
  }
}

// Function to save tracker to cookie
async function saveTracker(tracker: SearchTracker) {
  const response = new NextResponse()
  response.cookies.set(COOKIE_NAME, JSON.stringify(tracker), {
    maxAge: LOCKOUT_DURATION_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
  return response
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const address = searchParams.get('address')
  const format = searchParams.get('format') // 'mcp' for MCP format

  // Check if we have either coordinates or address
  if (!address && (!lat || !lon)) {
    return NextResponse.json(
      { error: 'Missing required parameters: either address OR (lat and lon)' },
      { status: 400 }
    )
  }

  let latitude: number;
  let longitude: number;
  let geocodedAddress: string;
  let validationResult: any = null;

  try {
    // If address is provided, validate search and increment counter BEFORE performing search
    if (address) {
      validationResult = await validateAndIncrementSearch()
      
      // Check if search is allowed
      if (!validationResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Search limit reached',
            message: validationResult.message,
            searchCount: validationResult.searchCount
          },
          { status: 429 }
        )
      }
      
      // Attempt geocoding
      const geocodeResult = await geocodingService.geocodeAddress(address);
      
      // Handle address not found gracefully
      if (geocodeResult.notFound) {
        return NextResponse.json({
          addressNotFound: true,
          address: address,
          message: 'Address not found',
          suggestion: 'Please check your address format and try again. Make sure to include city and state for U.S. addresses.',
          examples: [
            '123 Main Street, New York, NY',
            '456 Oak Avenue, Los Angeles, CA 90210',
            '789 Broadway, Chicago, IL'
          ]
        }, { status: 200 })
      }
      
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
      geocodedAddress = geocodeResult.displayName || address;
    } else {
      latitude = parseFloat(lat!);
      longitude = parseFloat(lon!);
      geocodedAddress = `${latitude}, ${longitude}`;

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat and lon must be valid numbers' },
          { status: 400 }
        )
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat must be between -90 and 90, lon must be between -180 and 180' },
          { status: 400 }
        )
      }
    }

    const service = OpportunityZoneService.getInstance()
    const startTime = Date.now()

    const result = await service.checkPoint(latitude, longitude)
    const queryTime = Date.now() - startTime

    // If MCP format is requested, return MCP-style response
    if (format === 'mcp') {
      const isInOZ = result.isInZone && result.zoneId; // Only true if both conditions are met
      const zoneId = result.zoneId;
      
      let mcpText = `Address "${geocodedAddress}" (${latitude}, ${longitude}) is`;
      
      if (isInOZ) {
        mcpText += ` in an opportunity zone.\nZone ID: ${zoneId}`;
      } else {
        mcpText += ` not in an opportunity zone.`;
      }
      
      mcpText += `\nData version: ${result.metadata.version}`;
      mcpText += `\nLast updated: ${result.metadata.lastUpdated}`;
      mcpText += `\nFeature count: ${result.metadata.featureCount}`;
      
      if (address) {
        mcpText += `\n[INFO] 🌍 Geocoding address: ${address}`;
        mcpText += `\n[SUCCESS] ✅ Geocoded "${address}" to ${latitude}, ${longitude}`;
      }
      
      mcpText += `\n[INFO] 🚀 Attempting PostGIS-optimized query...`;
      
      if (result.method === 'postgis') {
        mcpText += `\n[SUCCESS] ✅ PostGIS extension is available`;
        if (isInOZ) {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: ${zoneId}`;
        } else {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) is not in any opportunity zone`;
        }
        mcpText += `\n[SUCCESS] ⚡ PostGIS query completed - method: postgis`;
      } else {
        mcpText += `\n[INFO] 📦 Using fallback R-Bush spatial index`;
        if (isInOZ) {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) found in opportunity zone: ${zoneId}`;
        } else {
          mcpText += `\n[SUCCESS] 🎯 Point (${latitude}, ${longitude}) is not in any opportunity zone`;
        }
        mcpText += `\n[SUCCESS] ⚡ Query completed - method: ${result.method}`;
      }

      const mcpResponse = NextResponse.json({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            {
              type: 'text',
              text: mcpText
            }
          ]
        }
      }, { status: 200 });

      // Save the updated tracker to cookie if we have validation result
      if (validationResult && validationResult.tracker) {
        mcpResponse.cookies.set(COOKIE_NAME, JSON.stringify(validationResult.tracker), {
          maxAge: LOCKOUT_DURATION_MS / 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        })
      }

      return mcpResponse;
    }

    // Enhanced response with PostGIS optimization info (original format)
    const performance: Record<string, any> = {
      queryTimeMs: queryTime,
      isOptimized: result.method === 'postgis',
      optimizationActive: result.method === 'postgis' ? 'PostGIS spatial indexing with geometry simplification' : 
                         result.method === 'rbush' ? 'R-Bush spatial indexing with in-memory cache' : 
                         'Fallback mode - consider running PostGIS optimization'
    }

    // Add performance warnings/recommendations
    if (queryTime > 1000) {
      performance.warning = 'Query took longer than 1 second - consider running PostGIS optimization'
      performance.recommendation = 'Run: node scripts/seed-opportunity-zones-postgis.js --force'
    } else if (queryTime > 100) {
      performance.info = 'Query completed in sub-second time - good performance'
    } else {
      performance.info = 'Excellent query performance - under 100ms'
    }

    const response = {
      coordinates: {
        latitude,
        longitude
      },
      ...(address && { geocodedAddress }),
      isInOpportunityZone: result.isInZone,
      opportunityZoneId: result.zoneId || null,
      metadata: {
        queryTime: `${queryTime}ms`,
        method: result.method || 'unknown',
        lastUpdated: result.metadata.lastUpdated,
        featureCount: result.metadata.featureCount,
        nextRefreshDue: result.metadata.nextRefreshDue,
        version: result.metadata.version
      },
      performance
    }

    const finalResponse = NextResponse.json(response, { status: 200 })
    
    // Save the updated tracker to cookie if we have validation result
    if (validationResult && validationResult.tracker) {
      finalResponse.cookies.set(COOKIE_NAME, JSON.stringify(validationResult.tracker), {
        maxAge: LOCKOUT_DURATION_MS / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    return finalResponse
  } catch (error) {
    const queryTime = Date.now() - (Date.now() - 100) // Approximate timing for error case
    
    console.error('Error checking opportunity zone:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check opportunity zone',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(address && { address }),
        coordinates: latitude! && longitude! ? { latitude, longitude } : undefined,
        queryTime: `${queryTime}ms`,
        troubleshooting: {
          suggestion: 'Try running PostGIS optimization for better performance',
          command: 'node scripts/seed-opportunity-zones-postgis.js --force',
          checkSetup: 'node scripts/seed-opportunity-zones-postgis.js --setup-check'
        }
      },
      { status: 500 }
    )
  }
} 