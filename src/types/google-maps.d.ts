declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
    }

    class Marker {
      constructor(opts?: MarkerOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng | LatLngLiteral): void
      setTitle(title: string): void
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      title?: string
      icon?: string | MarkerIcon
    }

    interface MarkerIcon {
      url: string
      scaledSize?: Size
      anchor?: Point
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      zoomControl?: boolean
      mapTypeControl?: boolean
      fullscreenControl?: boolean
      streetViewControl?: boolean
      styles?: MapTypeStyle[]
    }

    interface MapTypeStyle {
      featureType?: string
      elementType?: string
      stylers?: Array<{ visibility?: string; [key: string]: any }>
    }
    
    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }
    
    interface LatLngLiteral {
      lat: number
      lng: number
    }
    
    namespace places {
      // New PlaceAutocompleteElement API
      class PlaceAutocompleteElement extends HTMLElement {
        addEventListener(type: 'gmp-select', listener: (event: PlaceSelectEvent) => void): void
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
        removeEventListener(type: 'gmp-select', listener: (event: PlaceSelectEvent) => void): void
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
        
        // Properties
        placeholder?: string
        country?: string | string[]
        types?: string[]
      }
      
      interface PlaceSelectEvent {
        placePrediction: PlacePrediction
      }
      
      interface PlacePrediction {
        toPlace(): Place
        place: Place
        description: string
        structured_formatting: {
          main_text: string
          secondary_text: string
        }
      }
      
      interface Place {
        fetchFields(options: { fields: string[] }): Promise<void>
        toJSON(): PlaceResult
        displayName?: string
        formattedAddress?: string
        location?: LatLng
        geometry?: {
          location: LatLng
        }
      }
      
      interface PlaceResult {
        displayName?: string
        formattedAddress?: string
        location?: {
          lat: number
          lng: number
        }
        geometry?: {
          location: {
            lat: number
            lng: number
          }
        }
      }
    }
    
    function importLibrary(library: string): Promise<any>
  }
}

export {} 