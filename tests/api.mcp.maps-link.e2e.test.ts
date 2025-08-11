import { test } from 'node:test';
import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function getTempToken(): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/api/temporary-key`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.token as string;
  } catch {
    return null;
  }
}

async function postMcp(payload: any, token: string) {
  const res = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
}

test('MCP check_opportunity_zone includes Maps link (coords)', async (t) => {
  const token = await getTempToken();
  if (!token) {
    t.skip('Dev server not running or temporary key endpoint unavailable; skipping.');
    return;
  }

  const payload = {
    jsonrpc: '2.0',
    id: '1',
    method: 'tools/call',
    params: {
      name: 'check_opportunity_zone',
      arguments: { latitude: 40.7128, longitude: -74.006 },
    },
  };

  const res = await postMcp(payload, token);
  assert.ok(res.ok, `Expected 2xx but got ${res.status}`);
  const body = await res.json();
  const textBlob = JSON.stringify(body);
  assert.match(
    textBlob,
    /\ud83d\udccd View on Google Maps: https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/,
    'Response should include a Google Maps link line'
  );
});

test('MCP check_opportunity_zone includes address in Maps link (address)', async (t) => {
  const token = await getTempToken();
  if (!token) {
    t.skip('Dev server not running or temporary key endpoint unavailable; skipping.');
    return;
  }

  const address = '1600 Pennsylvania Avenue NW, Washington, DC 20500';
  const payload = {
    jsonrpc: '2.0',
    id: '2',
    method: 'tools/call',
    params: {
      name: 'check_opportunity_zone',
      arguments: { address },
    },
  };

  const res = await postMcp(payload, token);
  assert.ok(res.ok, `Expected 2xx but got ${res.status}`);
  const body = await res.json();
  const textBlob = JSON.stringify(body);
  // Ensure link exists
  assert.match(textBlob, /View on Google Maps:/);
  // Ensure encoded address is part of the query
  assert.match(
    textBlob,
    /query=.*1600%20Pennsylvania%20Avenue%20NW%2C%20Washington%2C%20DC%2020500/,
    'Encoded address should appear in the Google Maps query parameter'
  );
});


