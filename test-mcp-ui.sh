#!/bin/bash

echo "🧪 Testing MCP UI Resource Integration"
echo "======================================"
echo ""

# Get a temporary API key
echo "📝 Creating temporary API key..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/temporary-key \
  -H "Content-Type: application/json")

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to create API key"
  exit 1
fi

echo "✅ API key created: ${TOKEN:0:20}..."
echo ""

# Test the MCP endpoint
echo "🗺️  Testing check_opportunity_zone with Times Square..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "check_opportunity_zone",
      "arguments": {
        "address": "Times Square, Manhattan, NY"
      }
    },
    "id": 1
  }')

echo "$RESPONSE" | python3 -c "
import sys
import json

try:
    data = json.load(sys.stdin)

    print('📊 MCP Response Structure:')
    print('=' * 50)
    print(json.dumps(data, indent=2))
    print('')
    print('=' * 50)

    # Check for content array
    if 'result' in data and 'content' in data['result']:
        content = data['result']['content']
        print(f'✅ Content array found with {len(content)} items')
        print('')

        # Check each content item
        for i, item in enumerate(content):
            print(f'Content Item {i+1}:')
            print(f'  Type: {item.get(\"type\")}')

            if item.get('type') == 'text':
                text = item.get('text', '')
                print(f'  Text preview: {text[:100]}...')

            elif item.get('type') == 'resource':
                resource = item.get('resource', {})
                print(f'  Resource URI: {resource.get(\"uri\")}')
                print(f'  MIME Type: {resource.get(\"mimeType\")}')
                print(f'  Embed URL: {resource.get(\"text\")}')
                print('')
                print('  🎉 SUCCESS! UI Resource with embed URL found!')
            print('')
    else:
        print('❌ No content array in response')

except Exception as e:
    print(f'❌ Error parsing response: {e}')
    sys.exit(1)
"

echo ""
echo "✅ Test complete!"
