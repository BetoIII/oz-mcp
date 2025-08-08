import { test, strictEqual } from 'node:test'
import { POST } from '../../src/app/api/listing-address/route'

async function exec(body: any) {
  const req = new Request('http://localhost/api/listing-address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const res = await POST(req)
  const json = await (res as any).json()
  return { status: (res as any).status, json }
}

test('returns 400 for missing url', async () => {
  const { status } = await exec({})
  strictEqual(status, 400)
})

test('returns 422 when address not found', async () => {
  // Mock service to throw NOT_FOUND for this test
  const mod = await import('../../src/lib/services/listing-address')
  const original = mod.listingAddressService.extractAddressFromUrl
  mod.listingAddressService.extractAddressFromUrl = async () => { const e: any = new Error('NOT_FOUND'); e.code = 'NOT_FOUND'; throw e }
  const { status } = await exec({ url: 'https://example.com/notfound' })
  strictEqual(status, 422)
  mod.listingAddressService.extractAddressFromUrl = original
})

test('returns 200 with address when found', async () => {
  const mod = await import('../../src/lib/services/listing-address')
  const original = mod.listingAddressService.extractAddressFromUrl
  mod.listingAddressService.extractAddressFromUrl = async () => '123 Main St, Springfield, IL 62701'
  const { status, json } = await exec({ url: 'https://example.com/listing' })
  strictEqual(status, 200)
  strictEqual(json.address, '123 Main St, Springfield, IL 62701')
  mod.listingAddressService.extractAddressFromUrl = original
})