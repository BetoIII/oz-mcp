import { setTimeout as delay } from 'timers/promises'

// Type for the log function
type LogFn = (type: 'info' | 'success' | 'warning' | 'error', message: string) => void

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// Strict US address validator
const STREET_SUFFIX = [
  'St', 'Street', 'Ave', 'Avenue', 'Blvd', 'Boulevard', 'Rd', 'Road', 'Dr', 'Drive', 'Ct', 'Court', 'Ln', 'Lane',
  'Way', 'Pkwy', 'Parkway', 'Pl', 'Place', 'Ter', 'Terrace', 'Trl', 'Trail', 'Cir', 'Circle', 'Hwy', 'Highway', 'Sq', 'Square'
]

const DIR = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']

const STRICT_ADDRESS_RE = new RegExp(
  String.raw`\b(\d{1,6}[A-Za-z]?)\s+` + // house number
  String.raw`(?:(?:${DIR.join('|')})\s+)?` + // optional directional prefix
  String.raw`([A-Za-z0-9'.\-]+(?:\s+[A-Za-z0-9'.\-]+)*)\s+` + // street name
  String.raw`(${STREET_SUFFIX.join('|')})\b` + // street suffix
  String.raw`(?:\s+(?:${DIR.join('|')}))?\s*,?\s*` + // optional directional suffix
  String.raw`([A-Za-z][A-Za-z.\- ]+?),\s*` + // city
  String.raw`([A-Z]{2})\s+` + // state
  String.raw`(\d{5}(?:-\d{4})?)\b`,
  'i'
)

const GENERIC_ADDRESS_RE = new RegExp(
  String.raw`\b\d{1,6}[A-Za-z]?\s+(?:${DIR.join('|')}\s+)?[A-Za-z0-9'.\-]+(?:\s+[A-Za-z0-9'.\-]+)*\s+(?:${STREET_SUFFIX.join('|')})\b(?:\s+(?:${DIR.join('|')}))?\s*,?\s+[A-Za-z][A-Za-z.\- ]+,\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b`,
  'i'
)

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function buildAddressFromMatch(m: RegExpMatchArray): string {
  const house = m[1]
  const streetName = m[2]
  const streetSuffix = m[3]
  const city = m[4]
  const state = m[5].toUpperCase()
  const zip = m[6]
  const street = `${house} ${streetName} ${streetSuffix}`
  return `${normalizeWhitespace(street)}, ${titleCase(normalizeWhitespace(city))}, ${state} ${zip}`
}

async function fetchWithTimeout(url: string, timeoutMs: number, log: LogFn): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    log('info', `Fetching HTML for ${url}`)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Opportunity Zone MCP Server',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }
    const text = await res.text()
    return text
  } finally {
    clearTimeout(timeout)
  }
}

export class ListingAddressService {
  private static instance: ListingAddressService
  private readonly REQUEST_TIMEOUT = 10000

  private constructor() {}

  static getInstance(): ListingAddressService {
    if (!ListingAddressService.instance) {
      ListingAddressService.instance = new ListingAddressService()
    }
    return ListingAddressService.instance
  }

  private tryExtractFromUrlPath(url: string, log: LogFn): string | null {
    try {
      const u = new URL(url)
      const path = decodeURIComponent(u.pathname)
      const segments = path.split('/').filter(Boolean)

      for (const seg of segments) {
        // Typical slugs like: 123-Main-St-SomeCity-ST-12345
        const candidate = normalizeWhitespace(seg.replace(/[\-_]+/g, ' '))
        const match = candidate.match(STRICT_ADDRESS_RE)
        if (match) {
          const addr = buildAddressFromMatch(match)
          log('success', `Extracted address from URL path segment: ${addr}`)
          return addr
        }
      }

      // Try the full path as a fallback after replacing dashes
      const combined = normalizeWhitespace(path.replace(/[\/_-]+/g, ' '))
      const match = combined.match(STRICT_ADDRESS_RE)
      if (match) {
        const addr = buildAddressFromMatch(match)
        log('success', `Extracted address from full URL path: ${addr}`)
        return addr
      }
    } catch {
      // ignore URL parse errors
    }
    return null
  }

  private tryExtractFromJsonLd(html: string, log: LogFn): string | null {
    const re = /"streetAddress"\s*:\s*"([^"]+)"[\s\S]*?"addressLocality"\s*:\s*"([^"]+)"[\s\S]*?"addressRegion"\s*:\s*"([A-Za-z]{2})"[\s\S]*?"postalCode"\s*:\s*"(\d{5}(?:-\d{4})?)"/i
    const m = html.match(re)
    if (m) {
      const street = normalizeWhitespace(m[1])
      const city = normalizeWhitespace(m[2])
      const state = m[3].toUpperCase()
      const zip = m[4]
      const candidate = `${street}, ${titleCase(city)}, ${state} ${zip}`
      const strict = candidate.match(STRICT_ADDRESS_RE)
      if (strict) {
        const addr = buildAddressFromMatch(strict)
        log('success', `Extracted address from JSON-LD: ${addr}`)
        return addr
      }
      // If street already seems normalized, still return
      const generic = candidate.match(GENERIC_ADDRESS_RE)
      if (generic) {
        log('success', `Extracted address from JSON-LD (generic): ${candidate}`)
        return candidate
      }
    }
    return null
  }

  private tryExtractFromHtml(html: string, log: LogFn): string | null {
    // 1) Try generic visible text address
    const m = html.match(GENERIC_ADDRESS_RE)
    if (m) {
      const candidate = normalizeWhitespace(m[0])
      // Re-validate strictly if possible
      const strict = candidate.match(STRICT_ADDRESS_RE)
      if (strict) {
        const addr = buildAddressFromMatch(strict)
        log('success', `Extracted address from HTML (strict): ${addr}`)
        return addr
      }
      log('success', `Extracted address from HTML (generic): ${candidate}`)
      return candidate
    }
    return null
  }

  async extractAddressFromUrl(url: string, log: LogFn = defaultLog): Promise<string> {
    if (!url || typeof url !== 'string') {
      const err = new Error('Invalid URL')
      ;(err as any).code = 'BAD_REQUEST'
      throw err
    }

    // URL-based pass
    const fromUrl = this.tryExtractFromUrlPath(url, log)
    if (fromUrl) return fromUrl

    // Fetch HTML and attempt extraction
    try {
      const html = await fetchWithTimeout(url, this.REQUEST_TIMEOUT, log)

      // Prefer JSON-LD
      const fromJsonLd = this.tryExtractFromJsonLd(html, log)
      if (fromJsonLd) return fromJsonLd

      // Fallback: generic HTML pattern
      const fromHtml = this.tryExtractFromHtml(html, log)
      if (fromHtml) return fromHtml
    } catch (e) {
      log('warning', `Failed to fetch or parse HTML: ${(e as Error).message}`)
    }

    const notFound = new Error('NOT_FOUND')
    ;(notFound as any).code = 'NOT_FOUND'
    throw notFound
  }
}

export const listingAddressService = ListingAddressService.getInstance()