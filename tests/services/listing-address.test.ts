import { test, strictEqual, rejects } from 'node:test'
import { ListingAddressService } from '../../src/lib/services/listing-address'

const service = ListingAddressService.getInstance()

// Mock fetch
;(global as any).fetch = async (url: string) => {
  const u = new URL(url)
  if (u.hostname === 'example.com' && u.pathname === '/jsonld') {
    return {
      ok: true,
      text: async () => `
        <script type="application/ld+json">
          {"address":{"@type":"PostalAddress","streetAddress":"1600 Amphitheatre Pkwy","addressLocality":"Mountain View","addressRegion":"CA","postalCode":"94043"}}
        </script>
      `
    } as any
  }
  if (u.hostname === 'example.com' && u.pathname === '/html') {
    return {
      ok: true,
      text: async () => `
        <div>Contact: 1 Infinite Loop, Cupertino, CA 95014</div>
      `
    } as any
  }
  if (u.hostname === 'example.com' && u.pathname === '/none') {
    return { ok: true, text: async () => `<div>No address here</div>` } as any
  }
  return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' } as any
}

test('extracts from URL path slug when present', async () => {
  const url = 'https://site.example/homedetails/123-Main-St-Springfield-IL-62701/123456'
  const address = await service.extractAddressFromUrl(url)
  strictEqual(address, '123 Main St, Springfield, IL 62701')
})

test('extracts from JSON-LD in HTML when available', async () => {
  const url = 'https://example.com/jsonld'
  const address = await service.extractAddressFromUrl(url)
  strictEqual(address, '1600 Amphitheatre Pkwy, Mountain View, CA 94043')
})

test('extracts from visible HTML when available', async () => {
  const url = 'https://example.com/html'
  const address = await service.extractAddressFromUrl(url)
  strictEqual(address, '1 Infinite Loop, Cupertino, CA 95014')
})

test('returns NOT_FOUND error when no address found', async () => {
  const url = 'https://example.com/none'
  await rejects(() => service.extractAddressFromUrl(url), (e: any) => e?.message === 'NOT_FOUND')
})