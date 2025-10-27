"use client"

import { Suspense, useEffect, useState } from "react"
import Script from "next/script"
import { MapPreview } from "@/components/MapPreview"
import { MapPin } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface MapEmbedContentProps {
  mapsLoaded: boolean
}

function MapEmbedContent({ mapsLoaded }: MapEmbedContentProps) {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)

  // Ensure we only render on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true)

    // Set up ResizeObserver to communicate height changes to parent iframe (for MCP-UI)
    // Use a minimum height to prevent collapsing (360px = 40% shorter than original 600px)
    const MIN_HEIGHT = 360;

    // Delay the ResizeObserver setup to allow content to load first
    const timer = setTimeout(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Ensure we never report a height less than MIN_HEIGHT
          const height = Math.max(entry.contentRect.height, MIN_HEIGHT);

          // Post message to parent window to adjust iframe height
          window.parent.postMessage({
            type: "ui-size-change",
            payload: { height },
          }, "*");
        }
      });

      // Observe the document body for size changes
      resizeObserver.observe(document.body);

      // Send initial height immediately
      window.parent.postMessage({
        type: "ui-size-change",
        payload: { height: Math.max(document.body.scrollHeight, MIN_HEIGHT) },
      }, "*");

      return () => {
        resizeObserver.disconnect();
      };
    }, 500); // Wait 500ms for initial render

    return () => {
      clearTimeout(timer);
    };
  }, [])

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const address = searchParams.get('address') || undefined
  const isOZ = searchParams.get('isOZ') === 'true'
  const tractId = searchParams.get('tractId') || undefined

  // Show loading state during SSR or while Maps API loads
  if (!isClient || !mapsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center text-gray-600">
          <MapPin className="mx-auto h-12 w-12 mb-4 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  // Validate required parameters
  if (!lat || !lng) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center text-gray-600">
          <MapPin className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Invalid Map Parameters</p>
          <p className="text-sm mt-2">Latitude and longitude are required</p>
        </div>
      </div>
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  // Validate numeric values
  if (isNaN(latitude) || isNaN(longitude)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center text-gray-600">
          <MapPin className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Invalid Coordinates</p>
          <p className="text-sm mt-2">Latitude and longitude must be valid numbers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen bg-gray-50 flex flex-col" style={{ minHeight: '360px', height: '360px' }}>
      <div className="flex-1 w-full p-2">
        <MapPreview
          latitude={latitude}
          longitude={longitude}
          address={address}
          isOpportunityZone={isOZ}
          tractId={tractId}
          className="h-full"
          showShapes={true}
        />
      </div>
    </div>
  )
}

export default function MapEmbedPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const [mapsLoaded, setMapsLoaded] = useState(false)

  const handleMapsLoad = () => {
    console.log('Google Maps script loaded')
    // Double-check that the API is actually available
    if (window.google && window.google.maps) {
      console.log('Google Maps API confirmed available')
      setMapsLoaded(true)
    } else {
      console.error('Google Maps script loaded but API not available')
      // Retry check after a short delay
      setTimeout(() => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API available on retry')
          setMapsLoaded(true)
        }
      }, 500)
    }
  }

  return (
    <>
      {/* Load Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="afterInteractive"
        onLoad={handleMapsLoad}
        onError={(e) => {
          console.error('Failed to load Google Maps script:', e)
        }}
      />

      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center text-gray-600">
            <MapPin className="mx-auto h-12 w-12 mb-4 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      }>
        <MapEmbedContent mapsLoaded={mapsLoaded} />
      </Suspense>
    </>
  )
}
