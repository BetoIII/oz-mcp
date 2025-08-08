import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractAddressFromUrl } from '../src/lib/services/listing-address'

// Reset fetch between tests
const originalFetch = global.fetch

test('extracts address from URL slug', async () => {
  // Ensure fetch is not called for this test
  ;(global as any).fetch = async () => {
    throw new Error('should not fetch for slug parsing test')
  }

  const url = 'https://www.zillow.com/homedetails/123-Main-St-Somecity-ST-12345/1234567_zpid/'
  const address = await extractAddressFromUrl(url)
  assert.strictEqual(address, '123 Main St, Somecity, ST 12345')
})

test('extracts address from JSON-LD in HTML', async () => {
  ;(global as any).fetch = async () => {
    return {
      ok: true,
      text: async () => `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Offer",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "456 Oak Ave",
                  "addressLocality": "Redwood City",
                  "addressRegion": "CA",
                  "postalCode": "94063"
                }
              }
            </script>
          </head>
          <body></body>
        </html>
      `
    } as any
  }

  const url = 'https://example.com/listing/abc'
  const address = await extractAddressFromUrl(url)
  assert.strictEqual(address, '456 Oak Ave, Redwood City, CA 94063')
})

test('throws NOT_FOUND when no address is present', async () => {
  ;(global as any).fetch = async () => {
    return {
      ok: true,
      text: async () => `<html><body><p>No address here</p></body></html>`
    } as any
  }

  const url = 'https://example.com/listing/no-address'
  await assert.rejects(async () => extractAddressFromUrl(url))
})

// Restore fetch after tests
;(global as any).fetch = originalFetch