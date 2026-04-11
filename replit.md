# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Includes a mobile Expo app (Storefront) and an Express API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Replit OpenAI integration (`gpt-5-mini` for descriptions, `gpt-image-1` for product images)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Storefront Mobile App (`artifacts/storefront`)

Expo React Native app for iOS and Android. Allows store owners to import a CSV file of inventory SKU numbers and displays products in an Amazon-style browsing interface.

### Features
- CSV import via document picker (expo-document-picker)
- AI-generated product descriptions (batch, via `/api/products/enrich`)
- AI-generated product images on-demand (via `/api/products/image`, cached in AsyncStorage)
- Amazon-style product grid with search and category filters
- Product detail screen with quantity selector
- Shopping cart with quantity controls and checkout

### Key Files
- `artifacts/storefront/context/StoreContext.tsx` — main store state (products, cart, import, enrichment)
- `artifacts/storefront/hooks/useProductImage.ts` — lazy image loading + AsyncStorage caching
- `artifacts/storefront/components/ProductCard.tsx` — product grid card with image support

## API Server (`artifacts/api-server`)

Express backend with product enrichment endpoints powered by OpenAI.

### Endpoints
- `GET /api/healthz` — health check
- `POST /api/products/enrich` — generate AI descriptions for a list of products
- `POST /api/products/image` — generate a product image using gpt-image-1 (returns base64)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
