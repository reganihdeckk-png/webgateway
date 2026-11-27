# GLASSY STORE

**Your Trusted Digital Marketplace** — crystal-blue / white Liquid Glass branding.

## Current status

The `feature/glassy-store-foundation` branch introduces the initial GLASSY STORE codebase in this repository. It contains a Next.js 15 storefront UI and a Cloudflare Workers + D1 read-only catalog API foundation. It is **not yet production-ready** and must not process real payments or orders.

## Repository structure

- `src/index.ts` — Cloudflare Worker API
- `migrations/0001_glassy_store_core.sql` — D1 schema for catalog, users, sessions, orders, deposits, ledger, webhooks, supplier logs, resellers, and audit events
- `web/` — Next.js 15 Liquid Glass storefront
- `wrangler.toml` — D1 binding configuration
- `.dev.vars.example` — local-only supplier environment variable template

## Cloudflare D1 setup

The provided D1 UUID is configured in `wrangler.toml`. Cloudflare also requires the exact existing D1 `database_name`. Replace `REPLACE_WITH_EXISTING_D1_DATABASE_NAME` with the name shown in Cloudflare Dashboard or `npx wrangler d1 list`. A database UUID alone does not provide permission to access or deploy to the account.

Install the API dependencies and authenticate Wrangler:

```bash
npm install
npx wrangler login
npx wrangler d1 list
```

After setting the exact database name, test the migration locally:

```bash
npm run dbLocal
npm run dev
```

Only after verifying the target database and reviewing the migration, apply it remotely:

```bash
npm run dbRemote
```

## Start the storefront

```bash
cd web
npm install
```

Set `NEXT_PUBLIC_API_BASE_URL` to the deployed Worker URL (or `http://localhost:8787` for local development), then run:

```bash
npm run dev
```

## API routes currently available

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products?page=1&limit=20&category=capcut&q=...`
- `GET /api/products/:slug`

Catalog results are read from D1; the project does not insert fake product listings.

## Supplier integration

Premku base URL and secret variable names are documented in `.dev.vars.example`. Authentication mode and endpoint paths remain intentionally unconfigured until official documentation is available and tested. Never guess an authentication scheme, expose secrets in browser code, or automatically retry an order when the first request outcome is unknown.

## Not implemented / not verified yet

- User registration, login, secure sessions, email verification, and password reset
- Admin and reseller protected dashboards
- Product synchronization from Premku
- Order submission, idempotency workflow, delivery credential encryption, and reconciliation
- Deposit creation, verified payment-provider callbacks, and wallet ledger crediting
- Authenticated webhook processing
- Rate limiting, production CORS allow-list, automated tests, and deployment verification

## Important architecture note

Cloudflare D1 is SQLite-compatible and is not PostgreSQL. This branch uses D1's native Workers binding and SQL migrations for the database ID supplied. Do not treat it as a PostgreSQL database or use a PostgreSQL connection string with it.

Never commit API keys, API secrets, Cloudflare tokens, customer data, or payment credentials. Configure secrets using local ignored files or Cloudflare Worker secrets after provider authentication is verified.
