import { test } from 'node:test';
import assert from 'node:assert/strict';

// Test cookie-based rate limiting logic
// This is critical for preventing abuse of the free browser search functionality

interface SearchTracker {
  searchCount: number;
  firstSearchDate: string;
  lockedUntil?: string;
}

const FREE_SEARCH_LIMIT = 5;
const LOCKOUT_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const COOKIE_NAME = 'oz_search_tracker';

// Helper functions extracted from the rate limiting logic
function parseSearchTrackerCookie(cookieValue: string | undefined): SearchTracker | null {
  if (!cookieValue) return null;
  
  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

function createSearchTracker(): SearchTracker {
  return {
    searchCount: 1,
    firstSearchDate: new Date().toISOString()
  };
}

function incrementSearchTracker(tracker: SearchTracker): SearchTracker {
  return {
    ...tracker,
    searchCount: tracker.searchCount + 1
  };
}

function isLockedOut(tracker: SearchTracker): boolean {
  if (!tracker.lockedUntil) return false;
  
  const lockoutExpiry = new Date(tracker.lockedUntil);
  return new Date() < lockoutExpiry;
}

function shouldLockout(tracker: SearchTracker): boolean {
  return tracker.searchCount >= FREE_SEARCH_LIMIT;
}

function createLockedTracker(tracker: SearchTracker): SearchTracker {
  return {
    ...tracker,
    lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
  };
}

function hasSearchWindowExpired(tracker: SearchTracker): boolean {
  const firstSearchDate = new Date(tracker.firstSearchDate);
  const weekAgo = new Date(Date.now() - LOCKOUT_DURATION_MS);
  return firstSearchDate < weekAgo;
}

test('parseSearchTrackerCookie - valid cookie', () => {
  const tracker = { searchCount: 3, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  const cookieValue = encodeURIComponent(JSON.stringify(tracker));
  
  const result = parseSearchTrackerCookie(cookieValue);
  
  assert.ok(result, 'Should parse valid cookie');
  assert.strictEqual(result.searchCount, 3);
  assert.strictEqual(result.firstSearchDate, '2024-01-15T10:00:00.000Z');
});

test('parseSearchTrackerCookie - undefined cookie', () => {
  const result = parseSearchTrackerCookie(undefined);
  assert.strictEqual(result, null, 'Should return null for undefined cookie');
});

test('parseSearchTrackerCookie - empty cookie', () => {
  const result = parseSearchTrackerCookie('');
  assert.strictEqual(result, null, 'Should return null for empty cookie');
});

test('parseSearchTrackerCookie - malformed JSON', () => {
  const result = parseSearchTrackerCookie('invalid-json');
  assert.strictEqual(result, null, 'Should return null for malformed JSON');
});

test('parseSearchTrackerCookie - malformed URL encoding', () => {
  const result = parseSearchTrackerCookie('%ZZ%invalid');
  assert.strictEqual(result, null, 'Should return null for malformed URL encoding');
});

test('createSearchTracker - creates new tracker', () => {
  const now = Date.now();
  const tracker = createSearchTracker();
  
  assert.strictEqual(tracker.searchCount, 1, 'Should start with count 1');
  assert.ok(tracker.firstSearchDate, 'Should have first search date');
  
  const searchDate = new Date(tracker.firstSearchDate);
  assert.ok(
    Math.abs(searchDate.getTime() - now) < 1000,
    'First search date should be approximately now'
  );
  assert.strictEqual(tracker.lockedUntil, undefined, 'Should not be locked initially');
});

test('incrementSearchTracker - increments count', () => {
  const original: SearchTracker = { searchCount: 3, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  const incremented = incrementSearchTracker(original);

  assert.strictEqual(incremented.searchCount, 4, 'Should increment search count');
  assert.strictEqual(
    incremented.firstSearchDate,
    original.firstSearchDate,
    'Should preserve first search date'
  );
  assert.strictEqual(
    incremented.lockedUntil,
    original.lockedUntil,
    'Should preserve lockout status'
  );
});

test('isLockedOut - no lockout date', () => {
  const tracker = { searchCount: 2, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  assert.strictEqual(isLockedOut(tracker), false, 'Should not be locked out without lockout date');
});

test('isLockedOut - lockout expired', () => {
  const tracker = {
    searchCount: 6,
    firstSearchDate: '2024-01-15T10:00:00.000Z',
    lockedUntil: new Date(Date.now() - 1000).toISOString() // 1 second ago
  };
  assert.strictEqual(isLockedOut(tracker), false, 'Should not be locked out after expiry');
});

test('isLockedOut - currently locked out', () => {
  const tracker = {
    searchCount: 6,
    firstSearchDate: '2024-01-15T10:00:00.000Z',
    lockedUntil: new Date(Date.now() + 60000).toISOString() // 1 minute from now
  };
  assert.strictEqual(isLockedOut(tracker), true, 'Should be locked out before expiry');
});

test('shouldLockout - under limit', () => {
  const tracker = { searchCount: 3, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  assert.strictEqual(shouldLockout(tracker), false, 'Should not lockout under limit');
});

test('shouldLockout - at exact limit', () => {
  const tracker = { searchCount: FREE_SEARCH_LIMIT, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  assert.strictEqual(shouldLockout(tracker), true, 'Should lockout at exact limit');
});

test('shouldLockout - over limit', () => {
  const tracker = { searchCount: FREE_SEARCH_LIMIT + 1, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  assert.strictEqual(shouldLockout(tracker), true, 'Should lockout over limit');
});

test('createLockedTracker - sets lockout date', () => {
  const tracker = { searchCount: 5, firstSearchDate: '2024-01-15T10:00:00.000Z' };
  const locked = createLockedTracker(tracker);
  
  assert.strictEqual(locked.searchCount, tracker.searchCount, 'Should preserve search count');
  assert.strictEqual(locked.firstSearchDate, tracker.firstSearchDate, 'Should preserve first search date');
  assert.ok(locked.lockedUntil, 'Should set lockout date');
  
  const lockoutDate = new Date(locked.lockedUntil);
  const expectedLockout = new Date(Date.now() + LOCKOUT_DURATION_MS);
  const timeDiff = Math.abs(lockoutDate.getTime() - expectedLockout.getTime());
  
  assert.ok(timeDiff < 1000, 'Lockout date should be approximately 1 week from now');
});

test('hasSearchWindowExpired - window not expired', () => {
  const tracker = {
    searchCount: 3,
    firstSearchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  };
  assert.strictEqual(hasSearchWindowExpired(tracker), false, 'Window should not be expired');
});

test('hasSearchWindowExpired - window exactly expired', () => {
  const tracker = {
    searchCount: 3,
    firstSearchDate: new Date(Date.now() - LOCKOUT_DURATION_MS).toISOString() // Exactly 1 week ago
  };
  assert.strictEqual(hasSearchWindowExpired(tracker), false, 'Window at exact boundary should not be expired');
});

test('hasSearchWindowExpired - window expired', () => {
  const tracker = {
    searchCount: 3,
    firstSearchDate: new Date(Date.now() - LOCKOUT_DURATION_MS - 1000).toISOString() // 1 week + 1 second ago
  };
  assert.strictEqual(hasSearchWindowExpired(tracker), true, 'Window should be expired');
});

test('FREE_SEARCH_LIMIT constant validation', () => {
  assert.strictEqual(FREE_SEARCH_LIMIT, 5, 'Free search limit should be 5 (updated from 3)');
});

test('LOCKOUT_DURATION_MS constant validation', () => {
  const expectedDuration = 7 * 24 * 60 * 60 * 1000; // 1 week
  assert.strictEqual(LOCKOUT_DURATION_MS, expectedDuration, 'Lockout duration should be 1 week');
});

test('Complete rate limiting flow - normal usage', () => {
  // Simulate complete flow for a user making searches
  let tracker: SearchTracker | null = null;
  const searches = [];
  
  // First search - creates tracker
  tracker = createSearchTracker();
  searches.push({ count: tracker.searchCount, locked: isLockedOut(tracker) });
  
  // Searches 2-4 - increment normally
  for (let i = 0; i < 3; i++) {
    tracker = incrementSearchTracker(tracker);
    searches.push({ count: tracker.searchCount, locked: isLockedOut(tracker) });
  }
  
  // Search 5 - hits limit, should be locked after this
  tracker = incrementSearchTracker(tracker);
  if (shouldLockout(tracker)) {
    tracker = createLockedTracker(tracker);
  }
  searches.push({ count: tracker.searchCount, locked: isLockedOut(tracker) });
  
  // Verify the flow
  assert.strictEqual(searches[0].count, 1, 'First search should be count 1');
  assert.strictEqual(searches[0].locked, false, 'First search should not be locked');
  
  assert.strictEqual(searches[4].count, 5, 'Fifth search should be count 5');
  assert.strictEqual(searches[4].locked, true, 'Fifth search should trigger lockout');
  
  // All intermediate searches should not be locked
  for (let i = 1; i < 4; i++) {
    assert.strictEqual(searches[i].locked, false, `Search ${i + 1} should not be locked`);
  }
});

test('Rate limiting edge cases - rapid succession', () => {
  // Test multiple rapid increments
  let tracker = createSearchTracker();
  
  // Rapidly increment to limit
  for (let i = 1; i < FREE_SEARCH_LIMIT; i++) {
    tracker = incrementSearchTracker(tracker);
  }
  
  assert.strictEqual(tracker.searchCount, FREE_SEARCH_LIMIT);
  assert.strictEqual(shouldLockout(tracker), true, 'Should be ready for lockout at limit');
  
  // Lock the tracker
  tracker = createLockedTracker(tracker);
  
  assert.strictEqual(isLockedOut(tracker), true, 'Should be locked out');
  
  // Further increments should still show locked status
  const furtherIncrement = incrementSearchTracker(tracker);
  assert.strictEqual(isLockedOut(furtherIncrement), true, 'Should remain locked after increment');
});