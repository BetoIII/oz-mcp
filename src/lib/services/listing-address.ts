// Type for the log function
export type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`)
};

interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
}

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .map(part => {
      if (/^(N|S|E|W|NE|NW|SE|SW)$/.test(part)) return part; // cardinal directions
      if (part.toUpperCase() === part) return part; // already upper (e.g., state)
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+/g, ' ') // collapse extra spaces
    .trim();
}

function normalizeSeparators(text: string): string {
  return decodeURIComponent(text)
    .replace(/[+_]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAddress(addr: ParsedAddress): string {
  const street = toTitleCase(addr.street.trim());
  const city = toTitleCase(addr.city.trim());
  const state = addr.state.trim().toUpperCase();
  const zip = addr.zip.trim();
  return `${street}, ${city}, ${state} ${zip}`;
}

function validateFinalAddress(address: string): boolean {
  // Stricter validation: 123 Main St, Some City, ST 12345(-6789)
  const strict = /^\d{1,6}\s+[^,]+,\s*[A-Za-z.'’&\-\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?$/;
  return strict.test(address);
}

function extractUsingRegex(text: string): ParsedAddress | null {
  const cleaned = normalizeSeparators(text);
  const addressRegex = /(\d{1,6}\s+[A-Za-z0-9.'’&\- ]+?\s+(?:St(?:reet)?|Ave(?:nue)?|Rd|Road|Blvd|Boulevard|Dr|Drive|Ct|Court|Ln|Lane|Way|Pl|Place|Cir|Circle|Pkwy|Parkway|Ter|Terrace|Trl|Trail|Hwy|Highway|Pike|Row|Sq|Square|Loop|Run|Cres|Crescent|Bend|Rte|Route)\b)\s*,?\s*([A-Za-z.'’&\- ]+?),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)(?![A-Za-z])/i;
  const match = cleaned.match(addressRegex);
  if (!match) return null;
  const [, street, city, state, zip] = match;
  return { street, city, state, zip };
}

function extractFromJsonLd(html: string): ParsedAddress | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRegex.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const found = findPostalAddress(parsed);
      if (found) return found;
    } catch {
      // ignore parse errors
    }
  }
  return null;
}

function findPostalAddress(node: any): ParsedAddress | null {
  if (!node || typeof node !== 'object') return null;

  const tryNode = (obj: any): ParsedAddress | null => {
    if (!obj || typeof obj !== 'object') return null;
    const addr = obj.address || (obj['@type'] && obj['@type'] === 'PostalAddress' ? obj : null);
    const addressObj = addr && !addr['@type'] ? addr : (obj['@type'] === 'PostalAddress' ? obj : null);
    const candidate = addressObj || addr;
    if (candidate && typeof candidate === 'object') {
      const street = candidate.streetAddress;
      const city = candidate.addressLocality;
      const state = candidate.addressRegion;
      const zip = candidate.postalCode;
      const country = candidate.addressCountry;
      if (street && city && state && zip && (!country || /^(US|USA|United States)$/i.test(country))) {
        return { street, city, state, zip };
      }
    }
    return null;
  };

  // Direct match on node
  const direct = tryNode(node);
  if (direct) return direct;

  // If array, search elements
  if (Array.isArray(node)) {
    for (const item of node) {
      const r = findPostalAddress(item);
      if (r) return r;
    }
    return null;
  }

  // Otherwise, search object properties
  for (const key of Object.keys(node)) {
    const r = findPostalAddress(node[key]);
    if (r) return r;
  }
  return null;
}

function extractFromMetaTags(html: string): ParsedAddress | null {
  const metas: Record<string, string> = {};
  const metaRegex = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRegex.exec(html)) !== null) {
    const name = m[1].toLowerCase();
    const content = m[2];
    metas[name] = content;
  }
  const street = metas['og:street-address'] || metas['street-address'] || metas['address'] || '';
  const city = metas['og:locality'] || metas['locality'] || '';
  const state = metas['og:region'] || metas['region'] || '';
  const zip = metas['og:postal-code'] || metas['postal-code'] || '';
  if (street && city && state && zip) return { street, city, state, zip };
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<[^>]+>/g, ' ');
}

async function fetchHtml(url: string, log: LogFn): Promise<string> {
  log('info', `Fetching HTML for ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Opportunity Zone MCP Server',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

function tryExtractFromUrl(u: URL, log: LogFn): ParsedAddress | null {
  const joined = [u.pathname, u.search, u.hash].filter(Boolean).join(' ');
  const parsed = extractUsingRegex(joined);
  if (parsed) {
    log('success', 'Extracted address from URL');
    return parsed;
  }
  // Try again on normalized separators
  const normalized = normalizeSeparators(joined);
  const parsed2 = extractUsingRegex(normalized);
  if (parsed2) {
    log('success', 'Extracted address from URL (normalized)');
    return parsed2;
  }
  return null;
}

export async function extractAddressFromUrl(listingUrl: string, log: LogFn = defaultLog): Promise<string> {
  if (!listingUrl || typeof listingUrl !== 'string') {
    throw new Error('Invalid URL');
  }

  let url: URL;
  try {
    url = new URL(listingUrl);
  } catch {
    throw new Error('Invalid URL');
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error('Invalid URL');
  }

  // 1) Try parsing from URL itself
  const fromUrl = tryExtractFromUrl(url, log);
  if (fromUrl) {
    const formatted = formatAddress(fromUrl);
    if (validateFinalAddress(formatted)) {
      return formatted;
    }
  }

  // 2) Fetch HTML and try JSON-LD, Meta, then text fallback
  const html = await fetchHtml(url.href, log);

  const fromJsonLd = extractFromJsonLd(html);
  if (fromJsonLd) {
    const formatted = formatAddress(fromJsonLd);
    if (validateFinalAddress(formatted)) {
      log('success', 'Extracted address from JSON-LD');
      return formatted;
    }
  }

  const fromMeta = extractFromMetaTags(html);
  if (fromMeta) {
    const formatted = formatAddress(fromMeta);
    if (validateFinalAddress(formatted)) {
      log('success', 'Extracted address from meta tags');
      return formatted;
    }
  }

  const text = stripHtml(html);
  const fromText = extractUsingRegex(text);
  if (fromText) {
    const formatted = formatAddress(fromText);
    if (validateFinalAddress(formatted)) {
      log('success', 'Extracted address from page text');
      return formatted;
    }
  }

  const err = new Error('NOT_FOUND');
  (err as any).code = 'NOT_FOUND';
  throw err;
}