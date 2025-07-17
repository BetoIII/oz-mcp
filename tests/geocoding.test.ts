import { test, strictEqual } from 'node:test'
import { GeocodingService } from '../src/lib/services/geocoding'
import { prisma } from '../src/app/prisma'

// Simple in-memory cache mock
const cache: Record<string, any> = {}
prisma.geocodingCache = {
  findUnique: async ({ where }: any) => cache[where.address] || null,
  upsert: async ({ where, update, create }: any) => {
    cache[where.address] = { id: 1, ...(create || {}), ...(update || {}) }
  }
} as any

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

  strictEqual(fetchCount, 1)
  strictEqual(first.latitude, second.latitude)
  strictEqual(first.longitude, second.longitude)
})
