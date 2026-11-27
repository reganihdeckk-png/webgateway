# GLASYPAY Cloudflare Worker API

## Implemented
- `GET /api/v1/health`: verifies D1 connectivity.
- `GET /api/v1/providers`: returns provider configuration without exposing credentials.
- `OPTIONS`: minimal CORS preflight.

## Intentionally unavailable
Wallet mutation, authentication, deposits, withdrawals, transfers, merchant payment creation and webhooks are not implemented. They return a non-success response. Do not connect a real payment flow yet.

## Local run
```sh
npm install
npx wrangler d1 migrations apply glasypay --local
npm run dev
```

Set an explicit `ALLOWED_ORIGIN` before exposing the API to a browser app. The wildcard default is for local development only.
