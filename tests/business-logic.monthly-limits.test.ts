import { test } from 'node:test';
import assert from 'node:assert/strict';

// Extract the hasUserExceededMonthlyLimit function for testing
// This is critical business logic that affects billing and user access
function hasUserExceededMonthlyLimit(user: any): boolean {
  // If no usage period started, they're within limits
  if (!user.usagePeriodStart) return false;
  
  // Check if 30 days have passed since usage period start
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // If usage period started more than 30 days ago, reset is needed (will be handled in increment)
  if (user.usagePeriodStart < thirtyDaysAgo) {
    return false; 
  }
  
  // Check current usage against limit
  return user.monthlyUsageCount >= user.monthlyUsageLimit;
}

test('hasUserExceededMonthlyLimit - new user with no usage period', () => {
  const user = {
    monthlyUsageCount: 0,
    monthlyUsageLimit: 5,
    usagePeriodStart: null
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, false, 'New user should not be considered over limit');
});

test('hasUserExceededMonthlyLimit - user within current 30-day period and under limit', () => {
  const user = {
    monthlyUsageCount: 3,
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, false, 'User under limit should not be considered exceeded');
});

test('hasUserExceededMonthlyLimit - user within current 30-day period and at exact limit', () => {
  const user = {
    monthlyUsageCount: 5,
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, true, 'User at exact limit should be considered exceeded');
});

test('hasUserExceededMonthlyLimit - user within current 30-day period and over limit', () => {
  const user = {
    monthlyUsageCount: 7,
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, true, 'User over limit should be considered exceeded');
});

test('hasUserExceededMonthlyLimit - user with period started over 30 days ago (should reset)', () => {
  const user = {
    monthlyUsageCount: 10, // Over limit
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, false, 'User with expired period should not be considered exceeded (ready for reset)');
});

test('hasUserExceededMonthlyLimit - edge case exactly 30 days ago', () => {
  const user = {
    monthlyUsageCount: 10,
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Exactly 30 days ago
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  // At exactly 30 days, the < comparison means it should still be considered active
  assert.strictEqual(result, true, 'User with period exactly 30 days old should still be limited');
});

test('hasUserExceededMonthlyLimit - user with very high limit', () => {
  const user = {
    monthlyUsageCount: 50,
    monthlyUsageLimit: 1000, // Premium user
    usagePeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, false, 'Premium user under high limit should not be exceeded');
});

test('hasUserExceededMonthlyLimit - user with 0 limit (blocked)', () => {
  const user = {
    monthlyUsageCount: 1,
    monthlyUsageLimit: 0, // Blocked user
    usagePeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  };
  
  const result = hasUserExceededMonthlyLimit(user);
  assert.strictEqual(result, true, 'User with 0 limit should be exceeded immediately');
});

// Test the 30-day rolling window calculation precision
test('hasUserExceededMonthlyLimit - 30-day boundary precision test', () => {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Just inside the 30-day window (29 days, 23 hours, 59 minutes ago)
  const justInside = new Date(thirtyDaysAgo + 60000); // 1 minute after the boundary
  const userJustInside = {
    monthlyUsageCount: 10,
    monthlyUsageLimit: 5,
    usagePeriodStart: justInside
  };
  
  assert.strictEqual(
    hasUserExceededMonthlyLimit(userJustInside), 
    true, 
    'User just inside 30-day window should be limited'
  );
  
  // Just outside the 30-day window (30 days, 1 minute ago)
  const justOutside = new Date(thirtyDaysAgo - 60000); // 1 minute before the boundary
  const userJustOutside = {
    monthlyUsageCount: 10,
    monthlyUsageLimit: 5,
    usagePeriodStart: justOutside
  };
  
  assert.strictEqual(
    hasUserExceededMonthlyLimit(userJustOutside), 
    false, 
    'User just outside 30-day window should be ready for reset'
  );
});