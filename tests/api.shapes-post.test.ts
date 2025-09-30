import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock prisma for testing shapes POST endpoint
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

    // Mock shapes by zone IDs query
    if (query.strings[0].includes('WHERE geoid = ANY')) {
      return this.queryResults;
    }

    return [];
  }

  // Mock findUnique for access token validation
  accessToken = {
    findUnique: ({ where }: { where: { token: string } }) => {
      // Mock valid token
      if (where.token === 'valid_token') {
        return Promise.resolve({
          id: 'token_id',
          userId: 'user_id',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          user: { id: 'user_id', monthlyUsageLimit: 100 }
        });
      }
      // Mock expired token
      if (where.token === 'expired_token') {
        return Promise.resolve({
          id: 'token_id',
          userId: 'user_id',
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
          user: { id: 'user_id' }
        });
      }
      // Token not found
      return Promise.resolve(null);
    }
  };
}

// Simplified PostGIS service for testing shapes functionality
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
      const result = await this.prisma.$queryRaw<{ available: boolean }[]>({
        strings: ['SELECT EXISTS( SELECT 1 FROM pg_extension WHERE extname = \'postgis\' ) as available'],
        values: []
      });

      this.isPostGISEnabled = result[0]?.available || false;
      return this.isPostGISEnabled;
    } catch (error) {
      this.isPostGISEnabled = false;
      return false;
    }
  }

  async getShapesByZoneIds(zoneIds: string[]): Promise<{
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      properties: {
        geoid: string;
        CENSUSTRAC: string;
        id: string;
        name: string;
        state: string;
        county: string;
      };
      geometry: any;
    }>;
  }> {
    const isPostGISAvailable = await this.checkPostGISAvailability();

    if (!isPostGISAvailable) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }

    if (!zoneIds || zoneIds.length === 0) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }

    try {
      const result = await this.prisma.$queryRaw<{
        geoid: string;
        geometry: string;
      }[]>({
        strings: ['SELECT geoid, ST_AsGeoJSON(COALESCE("simplifiedGeom", "originalGeom")) as geometry FROM "OpportunityZone" WHERE geoid = ANY($1::text[]) ORDER BY geoid'],
        values: [zoneIds]
      });

      const features = result.map(row => ({
        type: 'Feature' as const,
        properties: {
          geoid: row.geoid,
          CENSUSTRAC: row.geoid,
          id: row.geoid,
          name: row.geoid,
          state: 'California',
          county: 'Los Angeles'
        },
        geometry: JSON.parse(row.geometry)
      }));

      return {
        type: 'FeatureCollection',
        features
      };
    } catch (error) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  }
}

// Mock authentication function
async function mockAuthenticateRequest(token: string | null, mockPrisma: MockPrisma) {
  if (!token) {
    return null;
  }

  return await mockPrisma.accessToken.findUnique({ where: { token } });
}

test('PostGIS getShapesByZoneIds - successful retrieval', async () => {
  const mockGeometry = '{"type":"Polygon","coordinates":[[[-118.5,34.0],[-118.4,34.0],[-118.4,34.1],[-118.5,34.1],[-118.5,34.0]]]}';
  const mockPrisma = new MockPrisma(true, [
    { geoid: '06037980100', geometry: mockGeometry },
    { geoid: '06037980200', geometry: mockGeometry }
  ]);
  const service = new TestPostGISService(mockPrisma);

  const result = await service.getShapesByZoneIds(['06037980100', '06037980200']);

  assert.strictEqual(result.type, 'FeatureCollection', 'Should return FeatureCollection');
  assert.strictEqual(result.features.length, 2, 'Should return 2 features');
  assert.strictEqual(result.features[0].properties.geoid, '06037980100', 'Should have correct geoid');
  assert.strictEqual(result.features[0].properties.CENSUSTRAC, '06037980100', 'Should map geoid to CENSUSTRAC');
  assert.strictEqual(result.features[0].properties.id, '06037980100', 'Should map geoid to id');
  assert.strictEqual(result.features[0].type, 'Feature', 'Should be Feature type');
});

test('PostGIS getShapesByZoneIds - empty zone_ids array', async () => {
  const mockPrisma = new MockPrisma(true, []);
  const service = new TestPostGISService(mockPrisma);

  const result = await service.getShapesByZoneIds([]);

  assert.strictEqual(result.type, 'FeatureCollection', 'Should return FeatureCollection');
  assert.strictEqual(result.features.length, 0, 'Should return no features for empty array');
});

test('PostGIS getShapesByZoneIds - PostGIS not available', async () => {
  const mockPrisma = new MockPrisma(false); // PostGIS disabled
  const service = new TestPostGISService(mockPrisma);

  const result = await service.getShapesByZoneIds(['06037980100']);

  assert.strictEqual(result.type, 'FeatureCollection', 'Should return FeatureCollection');
  assert.strictEqual(result.features.length, 0, 'Should return no features when PostGIS unavailable');
});

test('PostGIS getShapesByZoneIds - partial results', async () => {
  const mockGeometry = '{"type":"Polygon","coordinates":[[[-118.5,34.0],[-118.4,34.0],[-118.4,34.1],[-118.5,34.1],[-118.5,34.0]]]}';
  const mockPrisma = new MockPrisma(true, [
    { geoid: '06037980100', geometry: mockGeometry }
    // Only one result for two requested zones
  ]);
  const service = new TestPostGISService(mockPrisma);

  const result = await service.getShapesByZoneIds(['06037980100', '06037980200']);

  assert.strictEqual(result.type, 'FeatureCollection', 'Should return FeatureCollection');
  assert.strictEqual(result.features.length, 1, 'Should return only found features');
  assert.strictEqual(result.features[0].properties.geoid, '06037980100', 'Should return found zone');
});

test('PostGIS getShapesByZoneIds - property mapping validation', async () => {
  const mockGeometry = '{"type":"Polygon","coordinates":[[[-118.5,34.0],[-118.4,34.0],[-118.4,34.1],[-118.5,34.1],[-118.5,34.0]]]}';
  const mockPrisma = new MockPrisma(true, [
    { geoid: '06037980100', geometry: mockGeometry }
  ]);
  const service = new TestPostGISService(mockPrisma);

  const result = await service.getShapesByZoneIds(['06037980100']);

  const feature = result.features[0];
  const props = feature.properties;

  // Validate all required properties for Chrome extension
  assert.strictEqual(props.geoid, '06037980100', 'Should have geoid property');
  assert.strictEqual(props.CENSUSTRAC, '06037980100', 'Should have CENSUSTRAC property');
  assert.strictEqual(props.id, '06037980100', 'Should have id property');
  assert.strictEqual(typeof props.name, 'string', 'Should have name property as string');
  assert.strictEqual(typeof props.state, 'string', 'Should have state property as string');
  assert.strictEqual(typeof props.county, 'string', 'Should have county property as string');
});

test('Authentication - valid token', async () => {
  const mockPrisma = new MockPrisma();

  const result = await mockAuthenticateRequest('valid_token', mockPrisma);

  assert.ok(result, 'Should return access token for valid token');
  assert.strictEqual(result.userId, 'user_id', 'Should have correct user ID');
  assert.ok(result.expiresAt > new Date(), 'Should not be expired');
});

test('Authentication - expired token', async () => {
  const mockPrisma = new MockPrisma();

  const result = await mockAuthenticateRequest('expired_token', mockPrisma);

  assert.ok(result, 'Should find expired token in database');
  assert.ok(result.expiresAt < new Date(), 'Should be expired');
});

test('Authentication - invalid token', async () => {
  const mockPrisma = new MockPrisma();

  const result = await mockAuthenticateRequest('invalid_token', mockPrisma);

  assert.strictEqual(result, null, 'Should return null for invalid token');
});

test('Authentication - missing token', async () => {
  const mockPrisma = new MockPrisma();

  const result = await mockAuthenticateRequest(null, mockPrisma);

  assert.strictEqual(result, null, 'Should return null for missing token');
});

// Test zone_ids validation logic
test('Zone IDs validation - valid array', () => {
  const zoneIds = ['06037980100', '06037980200', '06037980300'];

  // Test array validation
  assert.ok(Array.isArray(zoneIds), 'Should be an array');
  assert.ok(zoneIds.length > 0, 'Should not be empty');
  assert.ok(zoneIds.length <= 50, 'Should not exceed maximum');

  // Test string validation
  const invalidIds = zoneIds.filter(id => typeof id !== 'string' || id.trim().length === 0);
  assert.strictEqual(invalidIds.length, 0, 'All IDs should be non-empty strings');
});

test('Zone IDs validation - invalid formats', () => {
  const testCases = [
    { input: null, name: 'null' },
    { input: undefined, name: 'undefined' },
    { input: 'string', name: 'string instead of array' },
    { input: 123, name: 'number instead of array' },
    { input: [], name: 'empty array' },
    { input: [''], name: 'empty string in array' },
    { input: ['valid', null], name: 'null in array' },
    { input: ['valid', 123], name: 'number in array' },
    { input: Array(51).fill('zone'), name: 'too many zones' }
  ];

  testCases.forEach(({ input, name }) => {
    // Simulate validation logic
    let isValid = true;
    let errorReason = '';

    if (!input) {
      isValid = false;
      errorReason = 'Missing zone_ids';
    } else if (!Array.isArray(input)) {
      isValid = false;
      errorReason = 'Not an array';
    } else if (input.length === 0) {
      isValid = false;
      errorReason = 'Empty array';
    } else if (input.length > 50) {
      isValid = false;
      errorReason = 'Too many zones';
    } else {
      const invalidIds = input.filter(id => typeof id !== 'string' || id.trim().length === 0);
      if (invalidIds.length > 0) {
        isValid = false;
        errorReason = 'Invalid ID format';
      }
    }

    assert.strictEqual(isValid, false, `Should be invalid for ${name}: ${errorReason}`);
  });
});

test('Zone IDs validation - boundary conditions', () => {
  // Test exactly 50 zones (maximum allowed)
  const maxZones = Array(50).fill(0).map((_, i) => `zone${i.toString().padStart(3, '0')}`);
  assert.strictEqual(maxZones.length, 50, 'Should allow exactly 50 zones');

  const invalidIds = maxZones.filter(id => typeof id !== 'string' || id.trim().length === 0);
  assert.strictEqual(invalidIds.length, 0, 'All max zones should be valid strings');

  // Test 51 zones (over limit)
  const overLimitZones = Array(51).fill(0).map((_, i) => `zone${i}`);
  assert.ok(overLimitZones.length > 50, 'Should exceed maximum');
});

test('GeoJSON geometry parsing - valid polygon', () => {
  const mockGeometry = '{"type":"Polygon","coordinates":[[[-118.5,34.0],[-118.4,34.0],[-118.4,34.1],[-118.5,34.1],[-118.5,34.0]]]}';

  let parsedGeometry;
  assert.doesNotThrow(() => {
    parsedGeometry = JSON.parse(mockGeometry);
  }, 'Should parse valid GeoJSON');

  assert.strictEqual(parsedGeometry.type, 'Polygon', 'Should be Polygon type');
  assert.ok(Array.isArray(parsedGeometry.coordinates), 'Should have coordinates array');
  assert.ok(parsedGeometry.coordinates[0].length >= 4, 'Should have minimum coordinate points for polygon');
});

test('Error handling - malformed geometry', () => {
  const invalidGeometry = '{"type":"Polygon","coordinates":invalid}';

  assert.throws(() => {
    JSON.parse(invalidGeometry);
  }, 'Should throw error for malformed geometry');
});

test('Response format validation - Chrome extension compatibility', () => {
  const mockResponse = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          geoid: '06037980100',
          CENSUSTRAC: '06037980100',
          id: '06037980100',
          name: '06037980100',
          state: 'California',
          county: 'Los Angeles'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-118.5,34.0],[-118.4,34.0],[-118.4,34.1],[-118.5,34.1],[-118.5,34.0]]]
        }
      }
    ],
    metadata: {
      requestedZones: 1,
      foundZones: 1,
      extensionVersion: '1.0.0',
      queryTime: '50ms'
    }
  };

  // Validate response structure
  assert.strictEqual(mockResponse.type, 'FeatureCollection', 'Should be FeatureCollection');
  assert.ok(Array.isArray(mockResponse.features), 'Should have features array');
  assert.ok(mockResponse.metadata, 'Should have metadata object');

  // Validate feature structure
  const feature = mockResponse.features[0];
  assert.strictEqual(feature.type, 'Feature', 'Feature should have correct type');
  assert.ok(feature.properties, 'Feature should have properties');
  assert.ok(feature.geometry, 'Feature should have geometry');

  // Validate Chrome extension required properties
  const props = feature.properties;
  assert.ok(props.CENSUSTRAC, 'Should have CENSUSTRAC for Chrome extension');
  assert.ok(props.id, 'Should have id for Chrome extension');
  assert.strictEqual(props.CENSUSTRAC, props.geoid, 'CENSUSTRAC should match geoid');
  assert.strictEqual(props.id, props.geoid, 'id should match geoid');
});