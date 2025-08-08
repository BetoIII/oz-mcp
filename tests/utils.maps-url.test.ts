import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateGoogleMapsUrl } from '../src/lib/utils';

test('generateGoogleMapsUrl without address', () => {
  const url = generateGoogleMapsUrl(40.7128, -74.006);
  assert.strictEqual(
    url,
    'https://www.google.com/maps/search/?api=1&query=40.7128%2C-74.006'
  );
});

test('generateGoogleMapsUrl with address', () => {
  const url = generateGoogleMapsUrl(40.7128, -74.006, 'New York, NY');
  assert.strictEqual(
    url,
    'https://www.google.com/maps/search/?api=1&query=New%20York%2C%20NY%2040.7128%2C-74.006'
  );
});

test('generateGoogleMapsUrl encodes special characters', () => {
  const url = generateGoogleMapsUrl(34.0522, -118.2437, 'Los Angeles, CA #5 & Main');
  // Basic prefix check
  assert.ok(url.startsWith('https://www.google.com/maps/search/?api=1&query='));
  // Ensure the decoded query matches the expected readable form
  const decodedQuery = decodeURIComponent(url.split('query=')[1]);
  assert.strictEqual(decodedQuery, 'Los Angeles, CA #5 & Main 34.0522,-118.2437');
});


