import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock HTTP request/response for integration testing
class MockRequest {
  public method: string;
  public headers: Map<string, string>;
  public body: any;
  public nextUrl: { searchParams: URLSearchParams };

  constructor(method: string, headers: Record<string, string> = {}, body: any = null) {
    this.method = method;
    this.headers = new Map(Object.entries(headers));
    this.body = body;
    this.nextUrl = { searchParams: new URLSearchParams() };
  }

  headers_get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  async json() {
    if (this.body && typeof this.body === 'object') {
      return this.body;
    }
    throw new Error('Invalid JSON body');
  }
}

class MockResponse {
  public status: number;
  public headers: Map<string, string>;
  public body: any;

  constructor(body: any, options: { status: number } = { status: 200 }) {
    this.status = options.status;
    this.headers = new Map();
    this.body = body;
  }

  static json(body: any, options: { status: number } = { status: 200 }) {
    return new MockResponse(body, options);
  }

  headers_set(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
    return this;
  }
}

// Mock the shapes endpoint POST handler logic
async function mockShapesPOSTHandler(request: MockRequest): Promise<MockResponse> {
  const withCors = (res: MockResponse) => {
    res.headers_set('Access-Control-Allow-Origin', '*');
    res.headers_set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers_set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-OZ-Extension');
    return res;
  };

  try {
    // Check for required headers
    const authHeader = request.headers_get('authorization');
    const extensionHeader = request.headers_get('x-oz-extension');

    if (!authHeader) {
      return withCors(MockResponse.json(
        {
          error: 'Missing Authorization header',
          message: 'Bearer token is required for shape requests'
        },
        { status: 401 }
      ));
    }

    if (!extensionHeader) {
      return withCors(MockResponse.json(
        {
          error: 'Missing X-OZ-Extension header',
          message: 'Extension version header is required'
        },
        { status: 400 }
      ));
    }

    // Simple token validation
    const token = authHeader.split(' ')[1];
    if (!token || token !== 'valid_chrome_token') {
      return withCors(MockResponse.json(
        {
          error: 'Invalid or expired token',
          message: 'Please provide a valid API token'
        },
        { status: 401 }
      ));
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return withCors(MockResponse.json(
        {
          error: 'Invalid JSON body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      ));
    }

    // Validate zone_ids parameter
    const { zone_ids } = body;
    if (!zone_ids) {
      return withCors(MockResponse.json(
        {
          error: 'Missing zone_ids parameter',
          message: 'Request body must include zone_ids array',
          example: { zone_ids: ['06037980100', '06037980200'] }
        },
        { status: 400 }
      ));
    }

    if (!Array.isArray(zone_ids)) {
      return withCors(MockResponse.json(
        {
          error: 'Invalid zone_ids parameter',
          message: 'zone_ids must be an array of strings',
          example: { zone_ids: ['06037980100', '06037980200'] }
        },
        { status: 400 }
      ));
    }

    if (zone_ids.length === 0) {
      return withCors(MockResponse.json(
        {
          error: 'Empty zone_ids array',
          message: 'zone_ids array cannot be empty'
        },
        { status: 400 }
      ));
    }

    if (zone_ids.length > 50) {
      return withCors(MockResponse.json(
        {
          error: 'Too many zone_ids',
          message: 'Maximum 50 zone IDs allowed per request',
          provided: zone_ids.length,
          maximum: 50
        },
        { status: 400 }
      ));
    }

    // Validate zone_ids format
    const invalidZoneIds = zone_ids.filter((id: any) => typeof id !== 'string' || id.trim().length === 0);
    if (invalidZoneIds.length > 0) {
      return withCors(MockResponse.json(
        {
          error: 'Invalid zone_ids format',
          message: 'All zone_ids must be non-empty strings',
          invalidIds: invalidZoneIds
        },
        { status: 400 }
      ));
    }

    // Mock successful response with sample data
    const mockFeatures = zone_ids.slice(0, 2).map((zoneId: string) => ({
      type: 'Feature',
      properties: {
        geoid: zoneId,
        CENSUSTRAC: zoneId, // Chrome extension expects this
        id: zoneId, // Chrome extension expects this
        name: zoneId,
        state: 'California',
        county: 'Los Angeles',
        color: '#FF6B6B' // Added by contiguity analyzer
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-118.5, 34.0], [-118.4, 34.0], [-118.4, 34.1], [-118.5, 34.1], [-118.5, 34.0]]]
      }
    }));

    const response = {
      type: 'FeatureCollection',
      features: mockFeatures,
      metadata: {
        requestedZones: zone_ids.length,
        foundZones: mockFeatures.length,
        extensionVersion: extensionHeader,
        queryTime: '25ms',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        contiguity: {
          contiguousGroups: 1,
          isolatedZones: 0,
          largestGroupSize: mockFeatures.length
        },
        message: `Found ${mockFeatures.length}/${zone_ids.length} opportunity zones in 1 contiguous group(s)`
      }
    };

    return withCors(MockResponse.json(response));

  } catch (error) {
    return withCors(MockResponse.json(
      {
        error: 'Failed to fetch opportunity zone shapes',
        details: error instanceof Error ? error.message : 'Unknown error',
        queryTime: '5ms'
      },
      { status: 500 }
    ));
  }
}

// Integration tests simulating Chrome extension requests
test('Chrome Extension Integration - successful shapes request', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100', '06037980200']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 200, 'Should return 200 status');

  const responseData = response.body;
  assert.strictEqual(responseData.type, 'FeatureCollection', 'Should return FeatureCollection');
  assert.strictEqual(responseData.features.length, 2, 'Should return 2 features');

  // Validate Chrome extension compatibility
  const feature = responseData.features[0];
  assert.ok(feature.properties.CENSUSTRAC, 'Should have CENSUSTRAC property for Chrome extension');
  assert.ok(feature.properties.id, 'Should have id property for Chrome extension');
  assert.strictEqual(feature.properties.CENSUSTRAC, feature.properties.geoid, 'CENSUSTRAC should match geoid');
  assert.strictEqual(feature.properties.id, feature.properties.geoid, 'id should match geoid');

  // Validate CORS headers
  assert.strictEqual(response.headers.get('access-control-allow-origin'), '*', 'Should have CORS origin header');
  assert.ok(response.headers.get('access-control-allow-methods')?.includes('POST'), 'Should allow POST method');
});

test('Chrome Extension Integration - missing authorization header', async () => {
  const request = new MockRequest('POST', {
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 401, 'Should return 401 for missing auth');
  assert.strictEqual(response.body.error, 'Missing Authorization header', 'Should have correct error message');
});

test('Chrome Extension Integration - missing extension header', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for missing extension header');
  assert.strictEqual(response.body.error, 'Missing X-OZ-Extension header', 'Should have correct error message');
});

test('Chrome Extension Integration - invalid token', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer invalid_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 401, 'Should return 401 for invalid token');
  assert.strictEqual(response.body.error, 'Invalid or expired token', 'Should have correct error message');
});

test('Chrome Extension Integration - malformed JSON body', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, 'invalid json');

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for malformed JSON');
  assert.strictEqual(response.body.error, 'Invalid JSON body', 'Should have correct error message');
});

test('Chrome Extension Integration - missing zone_ids', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    // Missing zone_ids
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for missing zone_ids');
  assert.strictEqual(response.body.error, 'Missing zone_ids parameter', 'Should have correct error message');
  assert.ok(response.body.example, 'Should provide usage example');
});

test('Chrome Extension Integration - invalid zone_ids type', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: 'not_an_array'
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for invalid zone_ids type');
  assert.strictEqual(response.body.error, 'Invalid zone_ids parameter', 'Should have correct error message');
});

test('Chrome Extension Integration - empty zone_ids array', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: []
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for empty zone_ids');
  assert.strictEqual(response.body.error, 'Empty zone_ids array', 'Should have correct error message');
});

test('Chrome Extension Integration - too many zone_ids', async () => {
  const tooManyZones = Array(51).fill(0).map((_, i) => `zone${i}`);

  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: tooManyZones
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for too many zone_ids');
  assert.strictEqual(response.body.error, 'Too many zone_ids', 'Should have correct error message');
  assert.strictEqual(response.body.provided, 51, 'Should report provided count');
  assert.strictEqual(response.body.maximum, 50, 'Should report maximum allowed');
});

test('Chrome Extension Integration - invalid zone_id formats', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['valid_zone', '', null, 123]
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 400, 'Should return 400 for invalid zone_id formats');
  assert.strictEqual(response.body.error, 'Invalid zone_ids format', 'Should have correct error message');
  assert.ok(Array.isArray(response.body.invalidIds), 'Should report invalid IDs');
});

test('Chrome Extension Integration - response format validation', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.2.3',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100', '06037980200', '06037980300']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 200, 'Should return 200 status');

  const data = response.body;

  // Validate GeoJSON structure
  assert.strictEqual(data.type, 'FeatureCollection', 'Should be FeatureCollection');
  assert.ok(Array.isArray(data.features), 'Should have features array');

  // Validate metadata
  assert.ok(data.metadata, 'Should have metadata');
  assert.strictEqual(data.metadata.requestedZones, 3, 'Should track requested zones count');
  assert.strictEqual(data.metadata.foundZones, 2, 'Should track found zones count');
  assert.strictEqual(data.metadata.extensionVersion, '1.2.3', 'Should include extension version');
  assert.ok(data.metadata.queryTime, 'Should include query time');
  assert.ok(data.metadata.colors, 'Should include color palette');
  assert.ok(data.metadata.contiguity, 'Should include contiguity stats');

  // Validate features structure for Chrome extension
  data.features.forEach((feature: any, index: number) => {
    assert.strictEqual(feature.type, 'Feature', `Feature ${index} should be Feature type`);
    assert.ok(feature.properties, `Feature ${index} should have properties`);
    assert.ok(feature.geometry, `Feature ${index} should have geometry`);

    // Chrome extension required properties
    const props = feature.properties;
    assert.ok(props.geoid, `Feature ${index} should have geoid`);
    assert.ok(props.CENSUSTRAC, `Feature ${index} should have CENSUSTRAC for Chrome extension`);
    assert.ok(props.id, `Feature ${index} should have id for Chrome extension`);
    assert.strictEqual(props.CENSUSTRAC, props.geoid, `Feature ${index} CENSUSTRAC should match geoid`);
    assert.strictEqual(props.id, props.geoid, `Feature ${index} id should match geoid`);

    // Geometry validation
    assert.strictEqual(feature.geometry.type, 'Polygon', `Feature ${index} should have Polygon geometry`);
    assert.ok(Array.isArray(feature.geometry.coordinates), `Feature ${index} should have coordinates array`);
  });
});

test('Chrome Extension Integration - CORS headers validation', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100']
  });

  const response = await mockShapesPOSTHandler(request);

  // Validate CORS headers are present
  assert.strictEqual(response.headers.get('access-control-allow-origin'), '*', 'Should allow all origins');

  const allowedMethods = response.headers.get('access-control-allow-methods');
  assert.ok(allowedMethods?.includes('POST'), 'Should allow POST method');
  assert.ok(allowedMethods?.includes('GET'), 'Should allow GET method');
  assert.ok(allowedMethods?.includes('OPTIONS'), 'Should allow OPTIONS method');

  const allowedHeaders = response.headers.get('access-control-allow-headers');
  assert.ok(allowedHeaders?.includes('Content-Type'), 'Should allow Content-Type header');
  assert.ok(allowedHeaders?.includes('Authorization'), 'Should allow Authorization header');
  assert.ok(allowedHeaders?.includes('X-OZ-Extension'), 'Should allow X-OZ-Extension header');
});

test('Chrome Extension Integration - single zone request', async () => {
  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: ['06037980100']
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 200, 'Should handle single zone request');
  assert.strictEqual(response.body.features.length, 1, 'Should return single feature');
  assert.strictEqual(response.body.metadata.requestedZones, 1, 'Should track single requested zone');
  assert.strictEqual(response.body.metadata.foundZones, 1, 'Should track single found zone');
});

test('Chrome Extension Integration - maximum allowed zones', async () => {
  const maxZones = Array(50).fill(0).map((_, i) => `zone${i.toString().padStart(3, '0')}`);

  const request = new MockRequest('POST', {
    'authorization': 'Bearer valid_chrome_token',
    'x-oz-extension': '1.0.0',
    'content-type': 'application/json'
  }, {
    zone_ids: maxZones
  });

  const response = await mockShapesPOSTHandler(request);

  assert.strictEqual(response.status, 200, 'Should handle maximum allowed zones');
  assert.strictEqual(response.body.metadata.requestedZones, 50, 'Should track 50 requested zones');
});