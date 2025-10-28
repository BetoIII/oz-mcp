import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Type for the log function
export type LogFn = (type: "info" | "success" | "warning" | "error", message: string) => void;

const defaultLog: LogFn = (type, message) => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

// Input types for grok_address
export interface GrokAddressInput {
  screenshot?: string;  // base64 encoded image (PNG, JPEG, WEBP)
  html?: string;        // HTML content from page
  url?: string;         // Page URL
  metadata?: any;       // Structured data (JSON-LD, etc.)
  options?: {
    strictValidation?: boolean;     // default: true (≥80% confidence)
    geocodeValidation?: boolean;    // default: false (validate via geocoding)
  };
}

// Agent result interface
interface AgentResult {
  address: string | null;
  confidence: number;  // 0-1
  source: string;      // Agent name
  rawData?: any;       // Raw extraction data
}

// Final result interface
export interface GrokAddressResult {
  success: boolean;
  address?: string;
  confidence: number;
  sources: string[];
  warnings?: string[];
  agentResults?: AgentResult[];  // For debugging
}

// Address validation regex
const US_ADDRESS_REGEX = /^(\d{1,6})\s+([A-Za-z0-9\s.''&\-]+?)\s+(St(?:reet)?|Ave(?:nue)?|Rd|Road|Blvd|Boulevard|Dr|Drive|Ct|Court|Ln|Lane|Way|Pl|Place|Cir|Circle|Pkwy|Parkway|Ter|Terrace|Trl|Trail|Hwy|Highway|Pike|Row|Sq|Square|Loop|Run|Cres|Crescent|Bend|Rte|Route)\b\.?,?\s*([A-Za-z\s.''&\-]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i;

// Normalize address to standard format
function normalizeAddress(address: string): string {
  return address
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ', ')
    .trim();
}

// Validate US address format
function validateUSAddress(address: string): boolean {
  if (!address) return false;

  const normalized = normalizeAddress(address);

  // Check basic format
  if (!US_ADDRESS_REGEX.test(normalized)) return false;

  // Must contain city, state, ZIP
  if (!normalized.includes(',')) return false;

  // State must be 2 letters
  const stateMatch = normalized.match(/,\s*([A-Z]{2})\s+\d{5}/);
  if (!stateMatch) return false;

  return true;
}

// Screenshot Agent - uses vision AI to extract address from image
async function screenshotAgent(
  screenshot: string,
  log: LogFn
): Promise<AgentResult> {
  log('info', 'Screenshot Agent: Analyzing image...');

  try {
    // Try Anthropic Claude first
    if (process.env.ANTHROPIC_API_KEY) {
      log('info', 'Screenshot Agent: Using Claude vision');
      const result = await claudeVisionExtract(screenshot, log);
      if (result) return result;
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      log('info', 'Screenshot Agent: Falling back to OpenAI vision');
      const result = await openAIVisionExtract(screenshot, log);
      if (result) return result;
    }

    log('warning', 'Screenshot Agent: No AI API keys configured');
    return {
      address: null,
      confidence: 0,
      source: 'screenshot-agent'
    };

  } catch (error) {
    log('error', `Screenshot Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      address: null,
      confidence: 0,
      source: 'screenshot-agent'
    };
  }
}

// Claude vision extraction
async function claudeVisionExtract(
  screenshot: string,
  log: LogFn
): Promise<AgentResult | null> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Remove data URL prefix if present
    const base64Data = screenshot.replace(/^data:image\/[a-z]+;base64,/, '');

    // Detect media type from data URL or default to JPEG
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg';
    const mediaTypeMatch = screenshot.match(/^data:(image\/[a-z]+);base64,/);
    if (mediaTypeMatch) {
      const detectedType = mediaTypeMatch[1];
      if (detectedType === 'image/png' || detectedType === 'image/jpeg' ||
          detectedType === 'image/webp' || detectedType === 'image/gif') {
        mediaType = detectedType;
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: `Extract the U.S. mailing address from this image.

REQUIREMENTS:
- Return ONLY a valid U.S. street address in this format: "123 Street Name, City, ST 12345"
- Include street number, street name, city, state abbreviation (2 letters), and ZIP code
- If you find an address, respond with JUST the address and nothing else
- If NO address is visible or readable, respond with exactly: "NONE"
- Do NOT make up or guess addresses
- Do NOT include property descriptions, prices, or other details

EXAMPLES OF VALID RESPONSES:
- 123 Main Street, San Antonio, TX 78205
- 456 Oak Avenue, Los Angeles, CA 90210
- NONE`
          }
        ]
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    if (text === 'NONE' || !text) {
      log('info', 'Claude: No address found in screenshot');
      return {
        address: null,
        confidence: 0,
        source: 'claude-vision'
      };
    }

    // Validate extracted address
    if (validateUSAddress(text)) {
      log('success', `Claude: Extracted address: ${text}`);
      return {
        address: normalizeAddress(text),
        confidence: 0.85, // High confidence for Claude extraction
        source: 'claude-vision',
        rawData: text
      };
    } else {
      log('warning', `Claude: Invalid address format: ${text}`);
      return {
        address: null,
        confidence: 0.3, // Found something but invalid format
        source: 'claude-vision'
      };
    }

  } catch (error) {
    log('error', `Claude vision error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// OpenAI vision extraction
async function openAIVisionExtract(
  screenshot: string,
  log: LogFn
): Promise<AgentResult | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Ensure data URL prefix
    const imageData = screenshot.startsWith('data:') ? screenshot : `data:image/jpeg;base64,${screenshot}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          },
          {
            type: 'text',
            text: `Extract the U.S. mailing address from this image.

REQUIREMENTS:
- Return ONLY a valid U.S. street address in this format: "123 Street Name, City, ST 12345"
- Include street number, street name, city, state abbreviation (2 letters), and ZIP code
- If you find an address, respond with JUST the address and nothing else
- If NO address is visible or readable, respond with exactly: "NONE"
- Do NOT make up or guess addresses
- Do NOT include property descriptions, prices, or other details

EXAMPLES OF VALID RESPONSES:
- 123 Main Street, San Antonio, TX 78205
- 456 Oak Avenue, Los Angeles, CA 90210
- NONE`
          }
        ]
      }]
    });

    const text = response.choices[0]?.message?.content?.trim() || '';

    if (text === 'NONE' || !text) {
      log('info', 'OpenAI: No address found in screenshot');
      return {
        address: null,
        confidence: 0,
        source: 'openai-vision'
      };
    }

    // Validate extracted address
    if (validateUSAddress(text)) {
      log('success', `OpenAI: Extracted address: ${text}`);
      return {
        address: normalizeAddress(text),
        confidence: 0.85, // High confidence for GPT-4V extraction
        source: 'openai-vision',
        rawData: text
      };
    } else {
      log('warning', `OpenAI: Invalid address format: ${text}`);
      return {
        address: null,
        confidence: 0.3, // Found something but invalid format
        source: 'openai-vision'
      };
    }

  } catch (error) {
    log('error', `OpenAI vision error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// HTML Agent - parse HTML for addresses
async function htmlAgent(
  html: string,
  log: LogFn
): Promise<AgentResult> {
  log('info', 'HTML Agent: Parsing HTML content...');

  try {
    // Try JSON-LD first
    const jsonLdAddress = extractFromJsonLd(html);
    if (jsonLdAddress && validateUSAddress(jsonLdAddress)) {
      log('success', `HTML Agent: Found address in JSON-LD: ${jsonLdAddress}`);
      return {
        address: normalizeAddress(jsonLdAddress),
        confidence: 0.9, // High confidence for structured data
        source: 'html-jsonld'
      };
    }

    // Try meta tags
    const metaAddress = extractFromMetaTags(html);
    if (metaAddress && validateUSAddress(metaAddress)) {
      log('success', `HTML Agent: Found address in meta tags: ${metaAddress}`);
      return {
        address: normalizeAddress(metaAddress),
        confidence: 0.85, // High confidence for meta tags
        source: 'html-meta'
      };
    }

    // Try plain text extraction
    const textAddress = extractFromText(html);
    if (textAddress && validateUSAddress(textAddress)) {
      log('success', `HTML Agent: Found address in text: ${textAddress}`);
      return {
        address: normalizeAddress(textAddress),
        confidence: 0.7, // Medium confidence for text extraction
        source: 'html-text'
      };
    }

    log('info', 'HTML Agent: No address found');
    return {
      address: null,
      confidence: 0,
      source: 'html-agent'
    };

  } catch (error) {
    log('error', `HTML Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      address: null,
      confidence: 0,
      source: 'html-agent'
    };
  }
}

// Extract address from JSON-LD
function extractFromJsonLd(html: string): string | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const address = findPostalAddress(data);
      if (address) return address;
    } catch {
      continue;
    }
  }

  return null;
}

// Recursively find PostalAddress in JSON-LD
function findPostalAddress(node: any): string | null {
  if (!node || typeof node !== 'object') return null;

  // Check if this node has address data
  if (node.streetAddress && node.addressLocality && node.addressRegion && node.postalCode) {
    const street = node.streetAddress;
    const city = node.addressLocality;
    const state = node.addressRegion;
    const zip = node.postalCode;
    return `${street}, ${city}, ${state} ${zip}`;
  }

  // Check address property
  if (node.address && typeof node.address === 'object') {
    const result = findPostalAddress(node.address);
    if (result) return result;
  }

  // Search array elements
  if (Array.isArray(node)) {
    for (const item of node) {
      const result = findPostalAddress(item);
      if (result) return result;
    }
  }

  // Search object properties
  for (const key of Object.keys(node)) {
    const result = findPostalAddress(node[key]);
    if (result) return result;
  }

  return null;
}

// Extract from meta tags
function extractFromMetaTags(html: string): string | null {
  const metas: Record<string, string> = {};
  const metaRegex = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaRegex.exec(html)) !== null) {
    metas[match[1].toLowerCase()] = match[2];
  }

  const street = metas['og:street-address'] || metas['street-address'] || '';
  const city = metas['og:locality'] || metas['locality'] || '';
  const state = metas['og:region'] || metas['region'] || '';
  const zip = metas['og:postal-code'] || metas['postal-code'] || '';

  if (street && city && state && zip) {
    return `${street}, ${city}, ${state} ${zip}`;
  }

  return null;
}

// Extract from plain text
function extractFromText(html: string): string | null {
  // Strip HTML tags
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  // Try regex extraction
  const match = text.match(US_ADDRESS_REGEX);
  if (match) {
    return match[0];
  }

  return null;
}

// URL Agent - extract address from URL patterns
async function urlAgent(
  url: string,
  log: LogFn
): Promise<AgentResult> {
  log('info', 'URL Agent: Analyzing URL patterns...');

  try {
    const urlObj = new URL(url);
    const combined = [urlObj.pathname, urlObj.search, urlObj.hash].join(' ');
    const normalized = combined.replace(/[+_-]/g, ' ').replace(/\s+/g, ' ');

    const match = normalized.match(US_ADDRESS_REGEX);
    if (match && validateUSAddress(match[0])) {
      const address = normalizeAddress(match[0]);
      log('success', `URL Agent: Extracted address: ${address}`);
      return {
        address,
        confidence: 0.75, // Medium-high confidence for URL extraction
        source: 'url-pattern'
      };
    }

    log('info', 'URL Agent: No address found in URL');
    return {
      address: null,
      confidence: 0,
      source: 'url-agent'
    };

  } catch (error) {
    log('error', `URL Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      address: null,
      confidence: 0,
      source: 'url-agent'
    };
  }
}

// Metadata Agent - process structured data
async function metadataAgent(
  metadata: any,
  log: LogFn
): Promise<AgentResult> {
  log('info', 'Metadata Agent: Processing structured data...');

  try {
    // Try to find address in structured metadata
    const address = findPostalAddress(metadata);

    if (address && validateUSAddress(address)) {
      log('success', `Metadata Agent: Extracted address: ${address}`);
      return {
        address: normalizeAddress(address),
        confidence: 0.95, // Very high confidence for structured data
        source: 'metadata-structured'
      };
    }

    log('info', 'Metadata Agent: No valid address found');
    return {
      address: null,
      confidence: 0,
      source: 'metadata-agent'
    };

  } catch (error) {
    log('error', `Metadata Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      address: null,
      confidence: 0,
      source: 'metadata-agent'
    };
  }
}

// Coordinate all agents and return consensus result
export async function grokAddress(
  input: GrokAddressInput,
  log: LogFn = defaultLog
): Promise<GrokAddressResult> {
  log('info', 'Starting grok_address workflow...');

  const strictValidation = input.options?.strictValidation ?? true;
  const minConfidence = strictValidation ? 0.8 : 0.6;

  // Collect agent results
  const agentResults: AgentResult[] = [];

  // Run screenshot agent if screenshot provided
  if (input.screenshot) {
    const result = await screenshotAgent(input.screenshot, log);
    agentResults.push(result);
  }

  // Run HTML agent if HTML provided
  if (input.html) {
    const result = await htmlAgent(input.html, log);
    agentResults.push(result);
  }

  // Run URL agent if URL provided
  if (input.url) {
    const result = await urlAgent(input.url, log);
    agentResults.push(result);
  }

  // Run metadata agent if metadata provided
  if (input.metadata) {
    const result = await metadataAgent(input.metadata, log);
    agentResults.push(result);
  }

  // If no inputs provided, return error
  if (agentResults.length === 0) {
    log('error', 'No inputs provided');
    return {
      success: false,
      confidence: 0,
      sources: [],
      warnings: ['No inputs provided (screenshot, html, url, or metadata required)']
    };
  }

  // Filter successful results
  const successfulResults = agentResults.filter(r => r.address !== null);

  if (successfulResults.length === 0) {
    log('warning', 'No addresses found by any agent');
    return {
      success: false,
      confidence: 0,
      sources: agentResults.map(r => r.source),
      warnings: ['No addresses found in any provided inputs'],
      agentResults
    };
  }

  // Group by address (normalized for comparison)
  const addressGroups = new Map<string, AgentResult[]>();
  for (const result of successfulResults) {
    const normalized = result.address!.toLowerCase().replace(/\s+/g, ' ');
    const existing = addressGroups.get(normalized) || [];
    existing.push(result);
    addressGroups.set(normalized, existing);
  }

  // Find the address with highest consensus
  let bestAddress: string | null = null;
  let bestConfidence = 0;
  let bestSources: string[] = [];
  let bestResults: AgentResult[] = [];

  for (const [normalizedAddr, results] of addressGroups.entries()) {
    // Calculate consensus confidence
    let confidence = 0;
    const agreementCount = results.length;

    // Average base confidence
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    confidence = avgConfidence;

    // Bonus for multiple agents agreeing (+20% for 2+, +30% for 3+)
    if (agreementCount >= 2) {
      confidence = Math.min(1.0, confidence + 0.2);
    }
    if (agreementCount >= 3) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestAddress = results[0].address;
      bestSources = results.map(r => r.source);
      bestResults = results;
    }
  }

  // Check if confidence meets threshold
  if (bestAddress && bestConfidence >= minConfidence) {
    log('success', `Address extracted with ${(bestConfidence * 100).toFixed(1)}% confidence: ${bestAddress}`);
    return {
      success: true,
      address: bestAddress,
      confidence: bestConfidence,
      sources: bestSources,
      agentResults
    };
  } else if (bestAddress) {
    const warnings = [
      `Low confidence (${(bestConfidence * 100).toFixed(1)}%) - threshold is ${minConfidence * 100}%`,
      'Consider providing additional inputs for better accuracy'
    ];

    if (addressGroups.size > 1) {
      warnings.push(`Multiple conflicting addresses found (${addressGroups.size} variations)`);
    }

    log('warning', `Address found but confidence too low: ${bestConfidence.toFixed(2)} < ${minConfidence}`);
    return {
      success: false,
      confidence: bestConfidence,
      sources: bestSources,
      warnings,
      agentResults
    };
  }

  // No valid address found
  log('warning', 'No valid addresses found');
  return {
    success: false,
    confidence: 0,
    sources: agentResults.map(r => r.source),
    warnings: ['No valid U.S. addresses could be extracted from the provided inputs'],
    agentResults
  };
}
