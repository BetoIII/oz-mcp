"use client"

import { useEffect, useRef, useState } from "react"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { generateGoogleMapsUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin } from "lucide-react"

interface MapPreviewProps {
  latitude: number
  longitude: number
  address?: string
  isOpportunityZone?: boolean
  tractId?: string
  className?: string
}

export function MapPreview({
  latitude,
  longitude,
  address,
  isOpportunityZone,
  tractId,
  className = ""
}: MapPreviewProps) {
  const { isLoaded, loadError, google } = useGoogleMaps()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    async function initializeMap() {
      if (!isLoaded || !google || !mapRef.current) return

      try {
        // Check if maps library is available (it should be since we loaded the full API)
        if (!google.maps.Map) {
          console.error('Google Maps library not available')
          return
        }
        
        const center = { lat: latitude, lng: longitude }
        
        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        // Create marker
        const marker = new google.maps.Marker({
          position: center,
          map,
          title: address || `${latitude}, ${longitude}`,
          icon: {
            url: isOpportunityZone 
              ? "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' fill='%2316a34a' stroke='%23ffffff' stroke-width='2'/%3e%3ccircle cx='12' cy='10' r='3' fill='%23ffffff'/%3e%3c/svg%3e"
              : "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' fill='%23dc2626' stroke='%23ffffff' stroke-width='2'/%3e%3ccircle cx='12' cy='10' r='3' fill='%23ffffff'/%3e%3c/svg%3e",
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        })

        mapInstanceRef.current = map
        markerInstanceRef.current = marker
        setIsMapReady(true)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null)
        markerInstanceRef.current = null
      }
      mapInstanceRef.current = null
      setIsMapReady(false)
    }
  }, [isLoaded, google, latitude, longitude, address, isOpportunityZone])

  // Update map position when coordinates change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerInstanceRef.current) return

    const newCenter = { lat: latitude, lng: longitude }
    
    mapInstanceRef.current.setCenter(newCenter)
    markerInstanceRef.current.setPosition(newCenter)
    markerInstanceRef.current.setTitle(address || `${latitude}, ${longitude}`)
  }, [latitude, longitude, address, isMapReady])

  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-72 bg-gray-100 rounded-md ${className}`}>
        <div className="text-center text-gray-600">
          <MapPin className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Map failed to load</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-72 bg-gray-100 rounded-md animate-pulse ${className}`}>
        <div className="text-center text-gray-600">
          <MapPin className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  const googleMapsUrl = generateGoogleMapsUrl(latitude, longitude, address)

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-72 w-full rounded-md border"
          style={{ minHeight: "288px" }}
        />
        
        {/* Status Badge Overlay */}
        {isOpportunityZone !== undefined && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg ${
              isOpportunityZone 
                ? "bg-green-600" 
                : "bg-red-600"
            }`}>
              {isOpportunityZone ? "✅ Opportunity Zone" : "❌ Not an OZ"}
              {tractId && tractId !== "N/A" && (
                <span className="ml-1 opacity-80">({tractId})</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View in Google Maps Link */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs"
        >
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View in Google Maps</span>
          </a>
        </Button>
      </div>
    </div>
  )
}