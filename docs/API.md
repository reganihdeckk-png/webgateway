# GLASSY STORE API

Base URL is the deployed Cloudflare Worker URL. All responses are JSON and use `{ success, data?, message? }`.

## Public routes

- `GET /api/health` — service health and supplier integration readiness.
- `GET /api/categories` — active catalog categories.
- `GET /api/products?page=1&limit=20&category=capcut&q=...` — paginated available products from D1.
- `GET /api/products/:slug` — available product detail.

## Authentication

All passwords are hashed server-side using PBKDF2-HMAC-SHA-256 with a unique random salt. Session tokens are random opaque values; only SHA-256 token hashes are stored in D1. The browser cookie is HttpOnly, SameSite=Lax, and Secure on HTTPS.

- `POST /api/auth/register` — JSON `{ name, email, password }`; password must be at least 10 characters. New accounts receive member role only.
- `POST /api/auth/login` — JSON `{ email, password }`; sets the session cookie.
- `GET /api/auth/me` — current session user.
- `POST /api/auth/logout` — revokes current session.

Configure `ALLOWED_ORIGIN` to the exact storefront origin, e.g. `https://store.example.com`. Credentialed CORS is only emitted for that exact origin. For local development use `http://localhost:3000`.

Login and registration attempts are rate-limited by a one-way hash of the email address. Configure edge/WAF rate limiting as an additional production control.

## Admin

- `GET /api/admin/overview` — admin-only aggregate counts. There is intentionally no public route to grant admin role; provision the first admin through a controlled database operation and audit that action.

## Not yet exposed

Order creation, wallet/deposit, supplier sync, payment callbacks, password reset, email verification, and delivery credentials are not enabled. Do not create production payment flows until supplier and payment provider authentication has been verified with official documentation and sandbox tests.

## Error handling

- `400` invalid input
- `401` missing/invalid session or credentials
- `403` disallowed origin or insufficient role
- `404` route/product not found
- `409` duplicate account
- `429` rate limit
- `500` internal error (sensitive exception details are not returned)
