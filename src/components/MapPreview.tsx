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
  showShapes?: boolean // New prop to enable/disable shape overlay
}

export function MapPreview({
  latitude,
  longitude,
  address,
  isOpportunityZone,
  tractId,
  className = "",
  showShapes = true
}: MapPreviewProps) {
  const { isLoaded, loadError, google } = useGoogleMaps()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const dataLayerRef = useRef<any>(null)
  const loadedZonesRef = useRef<Set<string>>(new Set())
  const [isMapReady, setIsMapReady] = useState(false)
  const [isLoadingShapes, setIsLoadingShapes] = useState(false)

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
        
        // Initialize data layer for opportunity zone shapes
        if (showShapes) {
          const dataLayer = (map as any).data
          dataLayerRef.current = dataLayer
          
          // Set up data layer styling
          dataLayer.setStyle((feature: any) => {
            const color = feature.getProperty('color') || '#FF6B6B'
            const fillOpacity = feature.getProperty('fillOpacity') || 0.3
            const strokeOpacity = feature.getProperty('strokeOpacity') || 0.8
            const strokeWeight = feature.getProperty('strokeWeight') || 2
            
            return {
              fillColor: color,
              fillOpacity: fillOpacity,
              strokeColor: color,
              strokeWeight: strokeWeight,
              strokeOpacity: strokeOpacity,
              clickable: true
            }
          })
          
          // Add click handler for info windows
          dataLayer.addListener('click', (event: any) => {
            const feature = event.feature
            const geoid = feature.getProperty('geoid')
            const name = feature.getProperty('name') || geoid
            
            const infoWindow = new (google.maps as any).InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">
                    Opportunity Zone
                  </h4>
                  <p style="margin: 0; font-size: 12px; color: #666;">
                    Zone ID: ${geoid}
                  </p>
                </div>
              `,
              position: event.latLng
            })
            
            infoWindow.open(map)
            
            // Close info window when clicking elsewhere on the map
            const listener = (map as any).addListener('click', () => {
              infoWindow.close()
              ;(google.maps as any).event.removeListener(listener)
            })
          })
          
          // Set up viewport change listener with debouncing
          let boundsChangeTimeout: NodeJS.Timeout
          ;(map as any).addListener('bounds_changed', () => {
            clearTimeout(boundsChangeTimeout)
            boundsChangeTimeout = setTimeout(() => {
              loadVisibleShapes(map)
            }, 500)
          })
        }
        
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
      if (dataLayerRef.current) {
        dataLayerRef.current.forEach((feature: any) => {
          dataLayerRef.current.remove(feature)
        })
        dataLayerRef.current = null
      }
      mapInstanceRef.current = null
      loadedZonesRef.current.clear()
      setIsMapReady(false)
    }
  }, [isLoaded, google, latitude, longitude, address, isOpportunityZone, showShapes])

  // Update map position when coordinates change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerInstanceRef.current) return

    const newCenter = { lat: latitude, lng: longitude }
    
    mapInstanceRef.current.setCenter(newCenter)
    markerInstanceRef.current.setPosition(newCenter)
    markerInstanceRef.current.setTitle(address || `${latitude}, ${longitude}`)
  }, [latitude, longitude, address, isMapReady])

  // Function to load opportunity zone shapes within viewport
  const loadVisibleShapes = async (map: any) => {
    if (!showShapes || !dataLayerRef.current || isLoadingShapes) return

    try {
      setIsLoadingShapes(true)
      
      const bounds = (map as any).getBounds()
      if (!bounds) return

      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      const zoom = (map as any).getZoom()

      // Add buffer to viewport for smoother panning
      const latBuffer = (ne.lat() - sw.lat()) * 0.2
      const lngBuffer = (ne.lng() - sw.lng()) * 0.2

      const params = new URLSearchParams({
        north: (ne.lat() + latBuffer).toString(),
        south: (sw.lat() - latBuffer).toString(),
        east: (ne.lng() + lngBuffer).toString(),
        west: (sw.lng() - lngBuffer).toString(),
        zoom: zoom.toString()
      })

      const response = await fetch(`/api/opportunity-zones/shapes?${params}`)
      
      if (!response.ok) {
        console.error('Failed to fetch opportunity zone shapes:', response.statusText)
        return
      }

      const data = await response.json()
      
      if (data.features && Array.isArray(data.features)) {
        // Add only new zones that haven't been loaded yet
        let addedCount = 0
        
        for (const feature of data.features) {
          const geoid = feature.properties?.geoid
          if (geoid && !loadedZonesRef.current.has(geoid)) {
            dataLayerRef.current.addGeoJson(feature)
            loadedZonesRef.current.add(geoid)
            addedCount++
          }
        }

        console.log(`Added ${addedCount} new opportunity zones to map (${loadedZonesRef.current.size} total loaded)`)
      }
    } catch (error) {
      console.error('Error loading opportunity zone shapes:', error)
    } finally {
      setIsLoadingShapes(false)
    }
  }

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
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isOpportunityZone !== undefined && (
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
          )}
          
          {/* Loading indicator for shapes */}
          {showShapes && isLoadingShapes && (
            <div className="px-3 py-1 rounded-full text-xs font-medium text-white bg-blue-600 shadow-lg flex items-center gap-1">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Loading shapes...
            </div>
          )}
        </div>
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