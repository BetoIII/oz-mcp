# Custom Shape Overlay Feature

This document describes the new custom shape overlay feature that displays opportunity zone boundaries on Google Maps.

## Overview

The feature adds visual representation of opportunity zone shapes to the Google Maps interface, showing the actual geographic boundaries of opportunity zones with:

- **30% transparent shapes** so map details remain visible underneath
- **Color-coded zones** based on contiguity (contiguous zones share colors)
- **Dynamic loading** that only loads shapes within the current viewport
- **Interactive zones** with click-to-view zone information

## Implementation

### Backend Components

#### 1. PostGIS Query Service (`src/lib/services/postgis-opportunity-zones.ts`)

New method `getShapesInBounds()` that:
- Fetches opportunity zone geometries within specified bounds
- Uses dynamic simplification based on zoom level for performance
- Returns GeoJSON FeatureCollection format

```typescript
async getShapesInBounds(
  bounds: { north: number; south: number; east: number; west: number },
  zoomLevel: number
): Promise<FeatureCollection>
```

#### 2. Shapes API Endpoint (`src/app/api/opportunity-zones/shapes/route.ts`)

REST endpoint that:
- Accepts viewport bounds and zoom level as query parameters
- Returns GeoJSON features with color assignments
- Includes contiguity analysis statistics

**Endpoint**: `GET /api/opportunity-zones/shapes`

**Parameters**:
- `north`, `south`, `east`, `west`: Viewport bounds (required)
- `zoom`: Zoom level for shape simplification (optional, default: 12)

**Example**:
```bash
curl "http://localhost:3000/api/opportunity-zones/shapes?north=34.1&south=34.0&east=-118.0&west=-118.3&zoom=12"
```

#### 3. Contiguity Analyzer (`src/lib/utils/contiguity-analyzer.ts`)

Algorithm that:
- Analyzes geometric adjacency between opportunity zones
- Groups contiguous zones using depth-first search
- Assigns consistent colors to contiguous groups
- Rotates colors for non-contiguous groups

### Frontend Components

#### Enhanced MapPreview Component (`src/components/MapPreview.tsx`)

Enhanced with:
- **Google Maps Data Layer** integration for GeoJSON rendering
- **Viewport-based loading** with debounced bounds change detection
- **Interactive info windows** showing zone details on click
- **Performance optimizations** with zone caching and progressive loading

**New Props**:
- `showShapes?: boolean` - Enable/disable shape overlay (default: true)

**Key Features**:
- Automatically loads shapes when viewport changes
- Caches loaded zones to prevent duplicate loading
- Shows loading indicator during shape fetching
- Handles both zoom and pan operations efficiently

## Color Scheme

The feature uses 12 predefined colors that rotate based on contiguity:

```typescript
const ZONE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal  
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FECA57', // Yellow
  '#DDA0DD', // Plum
  '#FF8C69', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#82E0AA'  // Light Green
]
```

Contiguous zones (zones that share boundaries) receive the same color, while isolated or non-contiguous groups get different colors.

## Performance Optimizations

### 1. Zoom-Based Simplification

Geometry simplification varies by zoom level:
- Zoom < 10: 0.005 tolerance (very simplified)
- Zoom < 12: 0.002 tolerance (simplified)  
- Zoom < 14: 0.001 tolerance (default)
- Zoom < 16: 0.0005 tolerance (detailed)
- Zoom ≥ 16: 0.0001 tolerance (maximum detail)

### 2. Viewport-Based Loading

- Only loads shapes within current viewport + 20% buffer
- Debounced loading (500ms delay) prevents excessive API calls
- Progressive loading maintains smooth user experience

### 3. Caching and Memory Management

- Client-side caching prevents duplicate shape loading
- Automatic cleanup when component unmounts
- Limits to 100 shapes per API call to prevent memory issues

## Usage

### Basic Usage

The feature is automatically enabled in the MapPreview component:

```tsx
<MapPreview
  latitude={34.0522}
  longitude={-118.2437}
  address="Los Angeles, CA"
  isOpportunityZone={true}
  tractId="06037206031"
  showShapes={true} // Optional, defaults to true
/>
```

### Disabling Shapes

To display the map without shape overlays:

```tsx
<MapPreview
  latitude={34.0522}
  longitude={-118.2437}
  address="Los Angeles, CA"
  showShapes={false}
/>
```

## Testing

### Manual Testing

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Search for a Los Angeles address (e.g., "1600 Vine St, Los Angeles, CA")
4. Verify that:
   - Opportunity zone shapes appear on the map
   - Shapes are colored based on contiguity
   - Shapes are 30% transparent
   - Clicking shapes shows zone information
   - Panning/zooming loads new shapes appropriately

### API Testing

Test the shapes endpoint directly:

```bash
# Test LA area
curl "http://localhost:3000/api/opportunity-zones/shapes?north=34.1&south=34.0&east=-118.0&west=-118.3&zoom=12" | jq '.metadata'

# Expected response includes:
# - shapeCount: number of zones found
# - contiguity: analysis of zone groupings
# - queryTime: performance metrics
```

## Database Requirements

The feature requires:
- PostgreSQL with PostGIS extension
- Opportunity zone data seeded via `npm run seed`
- Spatial indexes on geometry columns for performance

## Browser Compatibility

The feature works in all modern browsers that support:
- Google Maps JavaScript API
- ES6+ features (arrow functions, async/await, etc.)
- CSS3 features (transforms, opacity, etc.)

## Future Enhancements

Potential improvements include:
- More sophisticated contiguity detection using advanced geometric algorithms
- Custom color schemes based on zone characteristics
- Legend/key showing color meanings
- Toggle controls for showing/hiding specific zone groups
- Performance optimizations for very large datasets
- Mobile-specific optimizations