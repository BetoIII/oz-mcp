import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock prisma for testing PostGIS service behavior
// This tests the critical spatial query logic without requiring a live database
class MockPrisma {
  private postGISEnabled: boolean;
  private queryResults: any[];

  constructor(postGISEnabled = true, queryResults: any[] = []) {
    this.postGISEnabled = postGISEnabled;
    this.queryResults = queryResults;
  }

  async $queryRaw(query: any) {
    // Mock PostGIS extension check
    if (query.strings[0].includes('pg_extension')) {
      return [{ available: this.postGISEnabled }];
    }
    
    // Mock spatial query results
    if (query.strings[0].includes('check_point_in_opportunity_zone_fast')) {
      return this.queryResults;
    }
    
    return [];
  }
}

// Simplified PostGIS service for testing core logic
class TestPostGISService {
  private isPostGISEnabled: boolean | null = null;
  private prisma: MockPrisma;

  constructor(mockPrisma: MockPrisma) {
    this.prisma = mockPrisma;
  }

  async checkPostGISAvailability(): Promise<boolean> {
    if (this.isPostGISEnabled !== null) {
      return this.isPostGISEnabled;
    }

    try {
      const result = await this.prisma.$queryRaw({
        strings: ['SELECT EXISTS( SELECT 1 FROM pg_extension WHERE extname = \'postgis\' ) as available'],
        values: []
      }) as { available: boolean }[];

      this.isPostGISEnabled = result[0]?.available ?? false;
      return this.isPostGISEnabled;
    } catch (error) {
      this.isPostGISEnabled = false;
      return false;
    }
  }

  async checkPointFast(lat: number, lon: number): Promise<{
    isInZone: boolean,
    zoneId?: string,
    method: 'postgis' | 'fallback'
  }> {
    const isPostGISAvailable = await this.checkPostGISAvailability();
    
    if (!isPostGISAvailable) {
      return {
        isInZone: false,
        method: 'fallback'
      };
    }

    try {
      const result = await this.prisma.$queryRaw({
        strings: ['SELECT * FROM check_point_in_opportunity_zone_fast($1, $2)'],
        values: [lat, lon]
      }) as { geoid: string }[];

      const isInZone = result.length > 0 && !!result[0]?.geoid;
      
      return {
        isInZone,
        zoneId: isInZone ? result[0].geoid : undefined,
        method: 'postgis'
      };
    } catch (error) {
      return {
        isInZone: false,
        method: 'fallback'
      };
    }
  }
}

test('PostGIS checkPostGISAvailability - extension enabled', async () => {
  const mockPrisma = new MockPrisma(true);
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPostGISAvailability();
  assert.strictEqual(result, true, 'Should detect PostGIS as available');
});

test('PostGIS checkPostGISAvailability - extension not installed', async () => {
  const mockPrisma = new MockPrisma(false);
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPostGISAvailability();
  assert.strictEqual(result, false, 'Should detect PostGIS as unavailable');
});

test('PostGIS checkPostGISAvailability - memoization behavior', async () => {
  const mockPrisma = new MockPrisma(true);
  const service = new TestPostGISService(mockPrisma);
  
  // First call should check database
  const result1 = await service.checkPostGISAvailability();
  assert.strictEqual(result1, true);
  
  // Second call should use cached result (no additional database call)
  const result2 = await service.checkPostGISAvailability();
  assert.strictEqual(result2, true);
  
  // Both calls should return same result from cache
  assert.strictEqual(result1, result2, 'Memoization should return consistent results');
});

test('PostGIS checkPointFast - point in opportunity zone', async () => {
  const mockPrisma = new MockPrisma(true, [{ geoid: '36061038100' }]);
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPointFast(40.7128, -74.0060);
  
  assert.strictEqual(result.isInZone, true, 'Point should be detected as in zone');
  assert.strictEqual(result.zoneId, '36061038100', 'Should return correct zone ID');
  assert.strictEqual(result.method, 'postgis', 'Should use PostGIS method');
});

test('PostGIS checkPointFast - point not in opportunity zone', async () => {
  const mockPrisma = new MockPrisma(true, []); // Empty result = not in zone
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPointFast(37.7749, -122.4194);
  
  assert.strictEqual(result.isInZone, false, 'Point should not be in zone');
  assert.strictEqual(result.zoneId, undefined, 'Should not return zone ID');
  assert.strictEqual(result.method, 'postgis', 'Should still use PostGIS method');
});

test('PostGIS checkPointFast - PostGIS unavailable fallback', async () => {
  const mockPrisma = new MockPrisma(false); // PostGIS not available
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPointFast(40.7128, -74.0060);
  
  assert.strictEqual(result.isInZone, false, 'Should fallback to false when PostGIS unavailable');
  assert.strictEqual(result.zoneId, undefined, 'Should not return zone ID in fallback');
  assert.strictEqual(result.method, 'fallback', 'Should indicate fallback method');
});

test('PostGIS checkPointFast - coordinate boundary validation', async () => {
  const mockPrisma = new MockPrisma(true, []);
  const service = new TestPostGISService(mockPrisma);
  
  // Test extreme coordinates
  const extremeCoords = [
    [90, 180],   // North pole, international date line
    [-90, -180], // South pole, opposite date line
    [0, 0],      // Equator, prime meridian
    [45.5, -122.5] // Normal coordinates
  ];
  
  for (const [lat, lon] of extremeCoords) {
    const result = await service.checkPointFast(lat, lon);
    assert.strictEqual(typeof result.isInZone, 'boolean', `Should return boolean for coords ${lat},${lon}`);
    assert.strictEqual(result.method, 'postgis', `Should use PostGIS for coords ${lat},${lon}`);
  }
});

test('PostGIS checkPointFast - malformed query result handling', async () => {
  // Test with malformed result (missing geoid)
  const mockPrisma = new MockPrisma(true, [{ invalid: 'field' }]);
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPointFast(40.7128, -74.0060);
  
  assert.strictEqual(result.isInZone, false, 'Should handle malformed results as not in zone');
  assert.strictEqual(result.zoneId, undefined, 'Should not return zone ID for malformed result');
  assert.strictEqual(result.method, 'postgis', 'Should still indicate PostGIS method was attempted');
});

test('PostGIS checkPointFast - multiple zones returned (edge case)', async () => {
  // Edge case: point on boundary returns multiple zones
  const mockPrisma = new MockPrisma(true, [
    { geoid: '36061038100' },
    { geoid: '36061038200' }
  ]);
  const service = new TestPostGISService(mockPrisma);
  
  const result = await service.checkPointFast(40.7128, -74.0060);
  
  assert.strictEqual(result.isInZone, true, 'Should be considered in zone when multiple returned');
  assert.strictEqual(result.zoneId, '36061038100', 'Should return first zone ID');
  assert.strictEqual(result.method, 'postgis', 'Should use PostGIS method');
});

test('PostGIS SQL function contract - query structure validation', async () => {
  let capturedQuery: any = null;
  
  class QueryCapturingMockPrisma extends MockPrisma {
    async $queryRaw(query: any) {
      capturedQuery = query;
      return super.$queryRaw(query);
    }
  }
  
  const mockPrisma = new QueryCapturingMockPrisma(true, []);
  const service = new TestPostGISService(mockPrisma);
  
  await service.checkPointFast(40.7128, -74.0060);
  
  assert.ok(capturedQuery, 'Should capture the SQL query');
  assert.ok(
    capturedQuery.strings[0].includes('check_point_in_opportunity_zone_fast'),
    'Should call the correct PostGIS function'
  );
  assert.strictEqual(capturedQuery.values[0], 40.7128, 'Should pass latitude as first parameter');
  assert.strictEqual(capturedQuery.values[1], -74.0060, 'Should pass longitude as second parameter');
});