# Agents.md

This file provides an overview of the **Opportunity Zone Search MCP** project for AI agents, outlining its structure, available tools, and usage patterns. It is modeled after the [Next.js + React + Redux + TypeScript guide](https://agentsmd.net/agents-md-examples/nextjs-react-redux-typescript-development-guide/).

---

## 📦 Project Overview

**Opportunity Zone Search MCP Server** is a Next.js-based MCP (Model Context Protocol) server that allows clients to:

- Check if geographic coordinates or postal addresses are located within U.S. opportunity zones.
- Convert addresses into latitude/longitude pairs via geocoding.
- Perform spatial queries with PostGIS for fast point-in-polygon lookups.
- Authenticate and authorize requests using OAuth 2.1 (PKCE, client credentials).
- Manage and rate-limit API usage.

The project exposes both a modern web interface and MCP endpoints for programmatic access.

### 🤖 Agent Integration

AI agents can leverage this repository to:

- Discover MCP tools in `src/mcp/tools` (e.g., `check_opportunity_zone`, `geocode_address`).
- Understand the OAuth flows under `src/pages/api/oauth` to simulate or test authorization requests.
- Load spatial data models and queries under `prisma/schema.prisma`.
- Inspect rate-limiting and caching logic in `src/lib/cache.ts`.

---

## 🔍 Directory Structure

```text
/ (root)
├─ components.json        # Frontend component config
├─ middleware.ts         # Next.js middleware for authentication
├─ next.config.ts        # Next.js configuration
├─ postcss.config.js     # CSS build settings
├─ tailwind.config.ts    # Tailwind CSS config
├─ tsconfig.json         # TypeScript config
├─ README.md             # Project README
├─ agents.md             # AI agent overview (this file)
├─ SERVER_MESSAGING_IMPROVEMENTS.md
├─ POSTGIS_OPTIMIZATION_IMPLEMENTATION.md
├─ src/
│  ├─ pages/             # Next.js pages and API routes
│  │  ├─ api/
│  │  │  ├─ opportunity-zones/  # REST endpoints
│  │  │  └─ oauth/        # OAuth handlers
│  │  └─ mcp/             # MCP adapters (SSE & HTTP-stream)
│  ├─ mcp/               # MCP tool definitions
│  ├─ lib/               # Utility libraries (cache, db, rate-limit)
│  └─ prisma/            # ORM schema and migrations
└─ tests/                # Unit and integration tests
```

> Note: The `src` folder is implied based on convention. Adjust paths if your project differs.

---

## ⚙️ Setup & Development

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/your-username/oz-mcp.git
   cd oz-mcp
   npm install --legacy-peer-deps
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL, GEOCODING_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL
   ```

3. Initialize database and seed opportunity zones:
   ```bash
   npx prisma migrate deploy
   npm run seed:opportunity-zones
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Access web UI at <http://localhost:3000> and MCP endpoints at `/mcp/sse` or `/mcp/http-stream`.

---

## 🤝 OAuth 2.1 & Agent Authentication

AI agents (or automated clients) must follow the OAuth 2.1 flows:

1. **Client Registration** (`POST /api/oauth/register`)
2. **Authorization Request** (`GET /oauth/authorize`)
3. **Token Exchange** (`POST /api/oauth/token`)
4. **Authenticated API Calls** with `Authorization: Bearer <token>`

Example:

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=...&client_id=...&code_verifier=..."
```

---

## 🛠️ MCP Tools

| Tool Name                 | Description                                                    |
|---------------------------|----------------------------------------------------------------|
| `check_opportunity_zone`  | Verify if lat/lng is inside an opportunity zone.               |
| `geocode_address`         | Geocode an address and check opportunity status.               |
| `validate_search_params`  | Ensure request parameters are well-formed.                     |
| `get_api_status`          | Retrieve API health, version, and rate-limit info.            |

Agents can invoke these tools using the MCP protocol:

```typescript
await use_mcp_tool("check_opportunity_zone", { latitude: 40.7, longitude: -74.0 });
```

---

## 📚 Testing & Quality

- **Unit Tests**: `npm test`
- **OAuth & MCP Tests**: `npm run test:oauth && npm run test:mcp`
- **Load Testing**: `npm run test:load`

Tests cover:
- Spatial queries and PostGIS integration
- OAuth authorization and token issuance
- MCP streaming and SSE endpoints

---

## 🚀 Deployment

**Vercel** is the recommended deployment platform:

1. Connect the GitHub repo
2. Add environment variables in Vercel dashboard
3. Deploy on push

Alternatively, use Docker or serverless functions on your preferred cloud provider.

---

## 📖 Further References

- Model Context Protocol: <https://modelcontextprotocol.io/docs>
- OAuth 2.1 Spec: <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10>
- PostGIS: <https://postgis.net/documentation/>
- Next.js: <https://nextjs.org/docs>

---

*Generated with ❤️ for seamless AI agent integration.*
