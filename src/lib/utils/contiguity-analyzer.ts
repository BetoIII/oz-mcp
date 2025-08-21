/**
 * Contiguity analyzer for opportunity zone shapes
 * Determines which zones are contiguous (share boundaries) for color assignment
 */

interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    geoid: string
    [key: string]: any
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface ContiguityGraph {
  [geoid: string]: Set<string>
}

export class ContiguityAnalyzer {
  private static readonly COORDINATE_PRECISION = 0.000001 // ~0.1 meters
  
  /**
   * Assign colors to features based on contiguity
   * Contiguous zones get the same color, non-contiguous zones get different colors
   */
  static assignColors(features: GeoJSONFeature[], availableColors: string[]): GeoJSONFeature[] {
    if (features.length === 0) return features
    
    // Build contiguity graph
    const graph = this.buildContiguityGraph(features)
    
    // Find connected components (groups of contiguous zones)
    const colorGroups = this.findConnectedComponents(graph)
    
    // Assign colors to groups
    const colorAssignments = new Map<string, string>()
    let colorIndex = 0
    
    for (const group of colorGroups) {
      const color = availableColors[colorIndex % availableColors.length]
      for (const geoid of group) {
        colorAssignments.set(geoid, color)
      }
      colorIndex++
    }
    
    // Apply colors to features
    return features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        color: colorAssignments.get(feature.properties.geoid) || availableColors[0],
        fillOpacity: 0.3,
        strokeOpacity: 0.8,
        strokeWeight: 2
      }
    }))
  }
  
  /**
   * Build a graph of which zones are adjacent to each other
   */
  private static buildContiguityGraph(features: GeoJSONFeature[]): ContiguityGraph {
    const graph: ContiguityGraph = {}
    
    // Initialize graph
    for (const feature of features) {
      graph[feature.properties.geoid] = new Set()
    }
    
    // Check all pairs for adjacency
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const feature1 = features[i]
        const feature2 = features[j]
        
        if (this.areAdjacent(feature1, feature2)) {
          graph[feature1.properties.geoid].add(feature2.properties.geoid)
          graph[feature2.properties.geoid].add(feature1.properties.geoid)
        }
      }
    }
    
    return graph
  }
  
  /**
   * Check if two features share a boundary (are adjacent/contiguous)
   */
  private static areAdjacent(feature1: GeoJSONFeature, feature2: GeoJSONFeature): boolean {
    const coords1 = this.extractAllCoordinates(feature1.geometry)
    const coords2 = this.extractAllCoordinates(feature2.geometry)
    
    // Check if any edges share vertices
    let sharedVertices = 0
    
    for (const coord1 of coords1) {
      for (const coord2 of coords2) {
        if (this.coordinatesEqual(coord1, coord2)) {
          sharedVertices++
          // If we find at least 2 shared vertices, they likely share an edge
          if (sharedVertices >= 2) {
            return true
          }
        }
      }
    }
    
    return false
  }
  
  /**
   * Extract all coordinates from a geometry (handles both Polygon and MultiPolygon)
   */
  private static extractAllCoordinates(geometry: GeoJSONFeature['geometry']): number[][] {
    const allCoords: number[][] = []
    
    if (geometry.type === 'Polygon') {
      // For Polygon, coordinates is number[][][]
      for (const ring of geometry.coordinates as number[][][]) {
        allCoords.push(...ring)
      }
    } else if (geometry.type === 'MultiPolygon') {
      // For MultiPolygon, coordinates is number[][][][]
      for (const polygon of geometry.coordinates as number[][][][]) {
        for (const ring of polygon) {
          allCoords.push(...ring)
        }
      }
    }
    
    return allCoords
  }
  
  /**
   * Check if two coordinates are equal within precision tolerance
   */
  private static coordinatesEqual(coord1: number[], coord2: number[]): boolean {
    if (coord1.length !== coord2.length) return false
    
    for (let i = 0; i < coord1.length; i++) {
      if (Math.abs(coord1[i] - coord2[i]) > this.COORDINATE_PRECISION) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Find connected components in the contiguity graph using DFS
   */
  private static findConnectedComponents(graph: ContiguityGraph): string[][] {
    const visited = new Set<string>()
    const components: string[][] = []
    
    for (const geoid in graph) {
      if (!visited.has(geoid)) {
        const component = this.dfsComponent(graph, geoid, visited)
        if (component.length > 0) {
          components.push(component)
        }
      }
    }
    
    return components
  }
  
  /**
   * Depth-first search to find all nodes in a connected component
   */
  private static dfsComponent(graph: ContiguityGraph, startNode: string, visited: Set<string>): string[] {
    const component: string[] = []
    const stack: string[] = [startNode]
    
    while (stack.length > 0) {
      const currentNode = stack.pop()!
      
      if (!visited.has(currentNode)) {
        visited.add(currentNode)
        component.push(currentNode)
        
        // Add all unvisited neighbors to stack
        for (const neighbor of graph[currentNode]) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor)
          }
        }
      }
    }
    
    return component
  }
  
  /**
   * Get statistics about the contiguity analysis
   */
  static getContiguityStats(features: GeoJSONFeature[]): {
    totalZones: number
    contiguousGroups: number
    largestGroupSize: number
    averageGroupSize: number
    isolatedZones: number
  } {
    const graph = this.buildContiguityGraph(features)
    const components = this.findConnectedComponents(graph)
    
    const groupSizes = components.map(group => group.length)
    const isolatedZones = groupSizes.filter(size => size === 1).length
    
    return {
      totalZones: features.length,
      contiguousGroups: components.length,
      largestGroupSize: Math.max(...groupSizes, 0),
      averageGroupSize: groupSizes.length > 0 ? groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length : 0,
      isolatedZones
    }
  }
}