# Deployment checklist

## Before deployment

1. Confirm the exact Cloudflare D1 database name for the supplied database UUID.
2. Replace the placeholder `database_name` in `wrangler.toml`; do not guess it.
3. Review SQL migrations and apply them locally first.
4. Set `ALLOWED_ORIGIN` to the exact production storefront origin in Worker environment variables.
5. Deploy the Worker and test `/api/health`, `/api/categories`, and `/api/products`.
6. Deploy `web/` to a supported Next.js host and set `NEXT_PUBLIC_API_BASE_URL` to the Worker URL.
7. Configure custom domain, HTTPS, monitoring, backups, and edge rate limits.
8. Rotate any supplier credentials that have been pasted into chat or committed. Store new values only as Worker secrets after official supplier auth documentation is confirmed.

## Database migrations

Run local migration:

```bash
npm install
npx wrangler d1 migrations apply DB --local
```

Remote migration is deliberately a manual, reviewed step:

```bash
npx wrangler d1 migrations apply DB --remote
```

Verify account, database name, and UUID before applying to remote D1.

## Current blockers

- This workspace cannot authenticate to the user's Cloudflare account or run a remote deployment.
- The exact D1 database name was not supplied.
- Premku authentication mode and endpoint paths remain unknown; no live supplier requests should be sent.
- No payment provider was specified or verified.
- Email delivery provider is not configured; password reset and email verification are not active.
- No live order/deposit operations are enabled.
