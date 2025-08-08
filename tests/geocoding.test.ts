import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GeocodingService } from '../src/lib/services/geocoding'
import { prisma } from '../src/app/prisma'

process.env.GEOCODING_API_KEY = process.env.GEOCODING_API_KEY || 'test'

// Simple in-memory cache mock
const cache: Record<string, any> = {}
;(prisma as any).geocodingCache = {
  findUnique: async ({ where }: any) => cache[where.address] || null,
  upsert: async ({ where, update, create }: any) => {
    cache[where.address] = { id: 1, ...(create || {}), ...(update || {}) }
  }
}

// Mock fetch to record calls
let fetchCount = 0
;(global as any).fetch = async () => {
  fetchCount++
  return {
    ok: true,
    json: async () => [{ lat: '1', lon: '2', display_name: 'Mock Address' }]
  } as any
}

const service = GeocodingService.getInstance()

test('geocodeAddress caches results', async () => {
  const addr = '123 Test St'
  const first = await service.geocodeAddress(addr)
  const second = await service.geocodeAddress(addr)

  assert.strictEqual(fetchCount, 1)
  assert.strictEqual(first.latitude, second.latitude)
  assert.strictEqual(first.longitude, second.longitude)
})
