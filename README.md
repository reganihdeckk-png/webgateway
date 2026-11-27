# GLASSY STORE

**Your Trusted Digital Marketplace** — crystal-blue / white Liquid Glass branding.

## Current status

The `feature/glassy-store-foundation` branch contains the initial GLASSY STORE application: a Next.js 15 storefront with Liquid Glass styling, Cloudflare Workers API, D1 migrations, member registration/login/logout, cookie sessions, rate limiting, and an admin overview endpoint.

This is a development foundation, **not a production-ready marketplace**. Real payments and supplier orders remain disabled until provider authentication and operational configuration are verified.

## Repository structure

- `src/index.ts` — Cloudflare Worker API and authentication
- `migrations/` — D1 schema and seed migrations
- `web/` — Next.js storefront, auth, and account dashboard
- `docs/API.md` — API route reference
- `docs/DEPLOYMENT.md` — deployment checklist
- `wrangler.toml` — D1 binding configuration

## Local development

1. Confirm the exact existing D1 database name and replace the placeholder in `wrangler.toml`.
2. Install Worker dependencies and apply local migrations:

```bash
npm install
npx wrangler d1 migrations apply DB --local
npm run dev
```

3. Start the Next.js storefront:

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8787` for local development. Configure Worker `ALLOWED_ORIGIN=http://localhost:3000` so browser authentication requests are accepted.

## Implemented API routes

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/admin/overview` (admin only)

Passwords use PBKDF2-HMAC-SHA-256; opaque session tokens are stored as SHA-256 hashes and delivered using HttpOnly cookies. New registrations cannot assign themselves privileged roles.

## D1 database

The supplied database UUID is configured in `wrangler.toml`. Wrangler additionally requires the exact D1 `database_name`. A UUID alone is insufficient to safely select and migrate the target database. Cloudflare account access is required to deploy or apply remote migrations.

Cloudflare D1 is SQLite-compatible, not PostgreSQL. The project uses D1's Workers binding API and SQL migrations.

## Supplier and payment integration

Premku API authentication and endpoint paths remain unconfigured pending official documentation and verification. Do not guess authentication headers or retry an order whose first request outcome is unknown. Deposit, wallet crediting, order submission, webhook processing, and delivery-account handling are not enabled.

Any supplier credentials shared in chat should be rotated and stored only as Cloudflare Worker secrets after official authentication is confirmed. Never commit secrets.

## Remaining before production

- Confirm D1 database name, configure Cloudflare account, apply migrations, and deploy Worker.
- Deploy Next.js storefront and configure production origin.
- Configure and test email verification and password reset using a trusted email provider.
- Provision the first admin through a controlled, audited database operation.
- Complete Premku integration after official auth and endpoint docs are obtained.
- Select and verify a payment provider before deposits or wallet credits are implemented.
- Implement full admin product/category/order management and reseller features.
- Implement order idempotency/reconciliation, payment webhooks, encrypted delivery data, and audit review.
- Run CI, security review, integration tests, and production smoke tests.

See `docs/API.md` and `docs/DEPLOYMENT.md` for details.
