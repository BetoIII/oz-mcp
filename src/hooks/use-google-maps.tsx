import { useEffect, useState } from 'react'

interface UseGoogleMapsReturn {
  isLoaded: boolean
  loadError: string | null
  google: typeof window.google | null
}

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [google, setGoogle] = useState<typeof window.google | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      setLoadError('Google Places API key is not configured')
      return
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setGoogle(window.google)
      setIsLoaded(true)
      return
    }

    // Create script element to load Google Maps API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true

    const handleLoad = () => {
      if (window.google && window.google.maps) {
        setGoogle(window.google)
        setIsLoaded(true)
        setLoadError(null)
      } else {
        setLoadError('Google Maps API failed to load properly')
      }
    }

    const handleError = () => {
      setLoadError('Failed to load Google Maps API')
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      // Don't remove the script on cleanup to avoid reloading
    }
  }, [])

  return { isLoaded, loadError, google }
} 