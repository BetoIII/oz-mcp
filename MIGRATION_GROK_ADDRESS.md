# Migration Guide: get_listing_address → grok_address

## Overview

The `get_listing_address` MCP tool has been **replaced** with the new `grok_address` tool, which provides multimodal address extraction using AI-powered agent workflows.

## Breaking Changes

⚠️ **The `get_listing_address` tool has been removed entirely.**

### What Changed

**Old Tool (REMOVED):**
- Tool name: `get_listing_address`
- Input: Single URL string
- Method: Regex-based HTML scraping

**New Tool:**
- Tool name: `grok_address`
- Input: Multimodal (screenshot, HTML, URL, metadata)
- Method: AI-powered agent workflow with confidence scoring

## Migration Path

### Basic URL-Only Usage

**Before:**
```typescript
const result = await mcp.call('get_listing_address', {
  url: 'https://www.zillow.com/homedetails/123-Main-St-...'
});
```

**After:**
```typescript
const result = await mcp.call('grok_address', {
  url: 'https://www.zillow.com/homedetails/123-Main-St-...'
});
```

### Enhanced Multimodal Usage

The new tool supports multiple input types for better accuracy:

```typescript
// With screenshot for higher accuracy
const result = await mcp.call('grok_address', {
  screenshot: 'data:image/png;base64,iVBORw0KGgo...',
  url: 'https://www.zillow.com/homedetails/...'
});

// With HTML content
const result = await mcp.call('grok_address', {
  html: '<html>...</html>',
  url: 'https://www.zillow.com/homedetails/...'
});

// With structured metadata
const result = await mcp.call('grok_address', {
  metadata: {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "San Antonio",
    "addressRegion": "TX",
    "postalCode": "78205"
  }
});

// Multiple inputs for best results
const result = await mcp.call('grok_address', {
  screenshot: base64Image,
  html: pageHTML,
  url: pageURL
});
```

## Response Format Changes

### Success Response

**Before:**
```
Address: 123 Main Street, San Antonio, TX 78205
```

**After:**
```
✅ Address extracted successfully:

**123 Main Street, San Antonio, TX 78205**

Confidence: 92.0%
Sources: claude-vision, html-jsonld
```

### Failure Response

**Before:**
```
Address not found
```

**After:**
```
❌ Address extraction failed

Candidate: 123 Main St, San Antonio, TX
Confidence: 65.0%
(Threshold: 80%)

Reasons:
• Low confidence (65.0%) - threshold is 80%

Suggestions:
• Provide multiple input types (screenshot + HTML) for better accuracy
• Ensure the image/content clearly shows a U.S. street address
```

## Chrome Extension Integration

If you're building a Chrome extension, here's how to integrate:

```javascript
// Example: Send screenshot + HTML to MCP server
async function extractAddress() {
  // Capture screenshot
  const screenshot = await chrome.tabs.captureVisibleTab(null, {
    format: 'png'
  });

  // Get page HTML
  const [{ result: html }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML
  });

  // Get structured data
  const [{ result: metadata }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent) : null;
    }
  });

  // Call MCP server
  const result = await fetch('https://your-mcp-server.com/api/mcp', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'grok_address',
        arguments: {
          screenshot,
          html,
          url: tab.url,
          metadata
        }
      }
    })
  });

  return await result.json();
}
```

## Environment Setup

### Required API Keys

Add to your `.env` file:

```bash
# Primary vision provider (recommended)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Fallback vision provider (optional but recommended)
OPENAI_API_KEY=sk-...
```

Get API keys:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

### Installation

Update your dependencies:

```bash
npm install @anthropic-ai/sdk openai
```

## Configuration Options

### Strict Validation (default: true)

```typescript
// Default: Require ≥80% confidence
const result = await mcp.call('grok_address', {
  url: 'https://...'
  // strictValidation: true (default)
});

// Relaxed: Accept ≥60% confidence
const result = await mcp.call('grok_address', {
  url: 'https://...',
  strictValidation: false
});
```

## Testing Your Migration

1. **Test with URL only** (simplest migration):
   ```typescript
   const result = await mcp.call('grok_address', { url: testUrl });
   ```

2. **Test with screenshot** (best accuracy):
   ```typescript
   const result = await mcp.call('grok_address', {
     screenshot: base64Screenshot,
     url: testUrl
   });
   ```

3. **Handle low confidence results**:
   ```typescript
   if (result.success) {
     console.log('Address:', result.address);
   } else {
     console.log('Failed:', result.warnings);
     // Prompt user or retry with more inputs
   }
   ```

## Troubleshooting

### "No AI API keys configured"

**Solution:** Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to your `.env` file.

### "Low confidence" errors

**Solution:** Provide multiple input types:
- Screenshot + HTML gives best results
- Ensure images are clear and high-resolution
- Check that addresses are visible in screenshots

### "Invalid address format"

**Solution:** The tool only extracts valid U.S. addresses with:
- Street number and name
- City
- State (2-letter abbreviation)
- ZIP code (5 or 9 digits)

## Benefits of the New Tool

✅ **Higher Accuracy**: AI-powered vision models extract addresses from images
✅ **Multimodal**: Combine screenshot, HTML, URL, and metadata for best results
✅ **Confidence Scoring**: Know when extractions are reliable
✅ **Agent Coordination**: Multiple extraction methods vote on the correct address
✅ **No Hallucinations**: Strict validation prevents false positives
✅ **Fallback Chain**: Claude → OpenAI ensures availability

## Support

For issues or questions:
- Open an issue: https://github.com/your-repo/oz-mcp/issues
- Check docs: `README.md`, `CLAUDE.md`
- Test in Playground: http://localhost:3000/playground
