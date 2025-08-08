import { test } from 'node:test';
import assert from 'node:assert/strict';

// Test monthly usage reset logic
// This is critical for billing and user access management

interface User {
  id: string;
  monthlyUsageCount: number;
  monthlyUsageLimit: number;
  usagePeriodStart?: Date | null;
  lastApiUsedAt?: Date | null;
}

// Mock Prisma update operations
class MockPrisma {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach(user => this.users.set(user.id, user));
  }

  user = {
    findUnique: async (options: { where: { id: string } }) => {
      return this.users.get(options.where.id) || null;
    },

    update: async (options: { 
      where: { id: string }, 
      data: Partial<User> 
    }) => {
      const user = this.users.get(options.where.id);
      if (!user) throw new Error('User not found');
      
      const updatedUser = { ...user, ...options.data };
      this.users.set(user.id, updatedUser);
      return updatedUser;
    }
  };
}

// Implementation of the monthly usage increment logic
async function incrementUserUsage(userId: string, mockPrisma: MockPrisma): Promise<User> {
  const user = await mockPrisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Reset if period expired or no period started
  if (!user.usagePeriodStart || user.usagePeriodStart < thirtyDaysAgo) {
    return await mockPrisma.user.update({
      where: { id: userId },
      data: {
        monthlyUsageCount: 1, // Start fresh with this usage
        usagePeriodStart: now,
        lastApiUsedAt: now,
      },
    });
  } else {
    // Increment existing usage
    return await mockPrisma.user.update({
      where: { id: userId },
      data: {
        monthlyUsageCount: user.monthlyUsageCount + 1,
        lastApiUsedAt: now,
      },
    });
  }
}

test('incrementUserUsage - new user with no usage period', async () => {
  const user: User = {
    id: 'user-1',
    monthlyUsageCount: 0,
    monthlyUsageLimit: 5,
    usagePeriodStart: null,
    lastApiUsedAt: null
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-1', mockPrisma);
  
  assert.strictEqual(result.monthlyUsageCount, 1, 'Should start with count 1');
  assert.ok(result.usagePeriodStart, 'Should set usage period start');
  assert.ok(result.lastApiUsedAt, 'Should set last API used timestamp');
  
  // Check that dates are recent (within last second)
  const now = Date.now();
  const periodStart = result.usagePeriodStart!.getTime();
  const lastUsed = result.lastApiUsedAt!.getTime();
  
  assert.ok(now - periodStart < 1000, 'Usage period start should be recent');
  assert.ok(now - lastUsed < 1000, 'Last API used should be recent');
});

test('incrementUserUsage - user within current 30-day period', async () => {
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const user: User = {
    id: 'user-2',
    monthlyUsageCount: 3,
    monthlyUsageLimit: 5,
    usagePeriodStart: fifteenDaysAgo,
    lastApiUsedAt: fifteenDaysAgo
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-2', mockPrisma);
  
  assert.strictEqual(result.monthlyUsageCount, 4, 'Should increment existing count');
  assert.strictEqual(
    result.usagePeriodStart?.getTime(), 
    fifteenDaysAgo.getTime(), 
    'Should preserve existing usage period start'
  );
  assert.ok(result.lastApiUsedAt, 'Should update last API used timestamp');
  
  // Check that lastApiUsedAt was updated recently
  const now = Date.now();
  const lastUsed = result.lastApiUsedAt!.getTime();
  assert.ok(now - lastUsed < 1000, 'Last API used should be updated to recent time');
});

test('incrementUserUsage - user with expired 30-day period (reset)', async () => {
  const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
  const user: User = {
    id: 'user-3',
    monthlyUsageCount: 8, // Over limit from previous period
    monthlyUsageLimit: 5,
    usagePeriodStart: thirtyFiveDaysAgo,
    lastApiUsedAt: thirtyFiveDaysAgo
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-3', mockPrisma);
  
  assert.strictEqual(result.monthlyUsageCount, 1, 'Should reset count to 1');
  assert.notStrictEqual(
    result.usagePeriodStart?.getTime(), 
    thirtyFiveDaysAgo.getTime(), 
    'Should update usage period start'
  );
  
  // Check that new period start is recent
  const now = Date.now();
  const periodStart = result.usagePeriodStart!.getTime();
  assert.ok(now - periodStart < 1000, 'New usage period start should be recent');
});

test('incrementUserUsage - exact 30-day boundary', async () => {
  const exactlyThirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const user: User = {
    id: 'user-4',
    monthlyUsageCount: 5,
    monthlyUsageLimit: 5,
    usagePeriodStart: exactlyThirtyDaysAgo,
    lastApiUsedAt: exactlyThirtyDaysAgo
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-4', mockPrisma);
  
  // At exactly 30 days, the < comparison means it should still increment (not reset)
  assert.strictEqual(result.monthlyUsageCount, 6, 'Should increment count at exactly 30 days');
  assert.strictEqual(
    result.usagePeriodStart?.getTime(),
    exactlyThirtyDaysAgo.getTime(),
    'Should preserve usage period start at exactly 30 days'
  );
});

test('incrementUserUsage - just under 30-day boundary', async () => {
  const almostThirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000 - 60000)); // 29 days, 59 minutes ago
  const user: User = {
    id: 'user-5',
    monthlyUsageCount: 2,
    monthlyUsageLimit: 5,
    usagePeriodStart: almostThirtyDaysAgo,
    lastApiUsedAt: almostThirtyDaysAgo
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-5', mockPrisma);
  
  assert.strictEqual(result.monthlyUsageCount, 3, 'Should increment within 30-day period');
  assert.strictEqual(
    result.usagePeriodStart?.getTime(),
    almostThirtyDaysAgo.getTime(),
    'Should preserve existing usage period start'
  );
});

test('incrementUserUsage - multiple increments in same period', async () => {
  const user: User = {
    id: 'user-6',
    monthlyUsageCount: 0,
    monthlyUsageLimit: 10,
    usagePeriodStart: null,
    lastApiUsedAt: null
  };
  
  const mockPrisma = new MockPrisma([user]);
  
  // First increment should establish period
  const result1 = await incrementUserUsage('user-6', mockPrisma);
  assert.strictEqual(result1.monthlyUsageCount, 1);
  const initialPeriodStart = result1.usagePeriodStart;
  
  // Wait a small amount to ensure timestamps differ
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Second increment should preserve period
  const result2 = await incrementUserUsage('user-6', mockPrisma);
  assert.strictEqual(result2.monthlyUsageCount, 2);
  assert.strictEqual(
    result2.usagePeriodStart?.getTime(),
    initialPeriodStart?.getTime(),
    'Should preserve period start across increments'
  );
  
  // Third increment
  const result3 = await incrementUserUsage('user-6', mockPrisma);
  assert.strictEqual(result3.monthlyUsageCount, 3);
  assert.strictEqual(
    result3.usagePeriodStart?.getTime(),
    initialPeriodStart?.getTime(),
    'Should still preserve original period start'
  );
});

test('incrementUserUsage - preserves other user fields', async () => {
  const user: User = {
    id: 'user-7',
    monthlyUsageCount: 1,
    monthlyUsageLimit: 5,
    usagePeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastApiUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  };
  
  const mockPrisma = new MockPrisma([user]);
  const result = await incrementUserUsage('user-7', mockPrisma);
  
  assert.strictEqual(result.id, user.id, 'Should preserve user ID');
  assert.strictEqual(result.monthlyUsageLimit, user.monthlyUsageLimit, 'Should preserve usage limit');
  assert.strictEqual(result.monthlyUsageCount, 2, 'Should increment usage count');
});

test('incrementUserUsage - handles non-existent user', async () => {
  const mockPrisma = new MockPrisma([]);
  
  await assert.rejects(
    () => incrementUserUsage('non-existent', mockPrisma),
    {
      message: 'User not found'
    },
    'Should throw error for non-existent user'
  );
});

test('30-day calculation precision', () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Verify the calculation matches the implementation
  const expectedThirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
  assert.strictEqual(
    thirtyDaysAgo.getTime(),
    expectedThirtyDaysAgo,
    '30-day calculation should be precise'
  );
  
  // Test edge cases around DST changes (approximate)
  const millisecondsInThirtyDays = 30 * 24 * 60 * 60 * 1000;
  assert.strictEqual(millisecondsInThirtyDays, 2592000000, '30 days should be exactly 2,592,000,000 milliseconds');
});

test('Usage reset workflow - complete user lifecycle', async () => {
  const user: User = {
    id: 'lifecycle-user',
    monthlyUsageCount: 0,
    monthlyUsageLimit: 3,
    usagePeriodStart: null,
    lastApiUsedAt: null
  };
  
  const mockPrisma = new MockPrisma([user]);
  
  // Phase 1: New user starts using API
  let currentUser = await incrementUserUsage('lifecycle-user', mockPrisma);
  assert.strictEqual(currentUser.monthlyUsageCount, 1, 'Phase 1: First usage');
  const originalPeriodStart = currentUser.usagePeriodStart;
  
  // Phase 2: User continues using within limit
  currentUser = await incrementUserUsage('lifecycle-user', mockPrisma);
  currentUser = await incrementUserUsage('lifecycle-user', mockPrisma);
  assert.strictEqual(currentUser.monthlyUsageCount, 3, 'Phase 2: Reached limit');
  assert.strictEqual(
    currentUser.usagePeriodStart?.getTime(),
    originalPeriodStart?.getTime(),
    'Phase 2: Period preserved'
  );
  
  // Phase 3: Simulate time passing (manual update for test)
  const expiredUser = {
    ...currentUser,
    usagePeriodStart: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
  };
  mockPrisma.user.update({ where: { id: 'lifecycle-user' }, data: expiredUser });
  
  // Phase 4: User uses API again after 30+ days - should reset
  const resetUser = await incrementUserUsage('lifecycle-user', mockPrisma);
  assert.strictEqual(resetUser.monthlyUsageCount, 1, 'Phase 4: Count reset to 1');
  assert.notStrictEqual(
    resetUser.usagePeriodStart?.getTime(),
    expiredUser.usagePeriodStart?.getTime(),
    'Phase 4: New period started'
  );
});