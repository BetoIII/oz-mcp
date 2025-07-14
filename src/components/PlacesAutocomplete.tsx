"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGoogleMaps } from '@/hooks/use-google-maps'
import { MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaceResult {
  formatted_address: string
  coordinates?: {
    lat: number
    lng: number
  }
  name?: string
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void
  onSubmit: (address: string) => void
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  isSearching?: boolean
}

export function PlacesAutocomplete({
  onPlaceSelect,
  onSubmit,
  value,
  onChange,
  placeholder = "Enter any U.S. address",
  disabled = false,
  className,
  isSearching = false,
}: PlacesAutocompleteProps) {
  const { isLoaded, loadError, google } = useGoogleMaps()
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isGoogleAutocompleteReady, setIsGoogleAutocompleteReady] = useState(false)

  // Initialize Google Places Autocomplete when ready
  useEffect(() => {
    if (!isLoaded || !google || !inputRef.current || disabled || autocompleteRef.current) {
      return
    }

    const initializeAutocomplete = async () => {
      try {
        // Import places library
        await google.maps.importLibrary('places')

        // Create a new Autocomplete instance attached to the input
        const autocomplete = new (google.maps.places as any).Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['address']
        })

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          
          if (place && place.formatted_address) {
            const selectedPlace: PlaceResult = {
              formatted_address: place.formatted_address,
              name: place.name,
              coordinates: place.geometry?.location ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              } : undefined
            }

            onChange(place.formatted_address)
            onPlaceSelect(selectedPlace)
          }
        })

        autocompleteRef.current = autocomplete
        setIsGoogleAutocompleteReady(true)

      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error)
      }
    }

    initializeAutocomplete()

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        autocompleteRef.current = null
      }
      setIsGoogleAutocompleteReady(false)
    }
  }, [isLoaded, google, disabled, onChange, onPlaceSelect])

  // Handle manual form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isSearching) {
      onSubmit(value.trim())
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  // Loading state
  if (loadError) {
    return (
      <div className="text-red-500 text-sm">
        Error loading Google Places: {loadError}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-10 rounded-md border bg-muted animate-pulse" />
        <Button disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex space-x-2", className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        autoComplete="off"
      />
      
      <Button
        type="submit"
        disabled={!value.trim() || disabled || isSearching}
        className="shrink-0"
      >
        {isSearching ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Searching...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Search
          </>
        )}
      </Button>
    </form>
  )
} 