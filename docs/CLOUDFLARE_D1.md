# Cloudflare D1

The Worker uses the `DB` binding declared in `workers/api/wrangler.toml`. The configured database ID was supplied by the project owner. This file does not prove that the remote database exists or that the binding is authorized.

## Local validation
Run `npx wrangler d1 migrations apply glasypay --local` from `workers/api` to apply the migration to a local D1 database.

## Remote caution
Before using `--remote`, authenticate Wrangler, verify the account and database name/ID in the Cloudflare dashboard, and take a backup. Remote migrations and Worker deployment have not been run from this project session.

All payment providers are seeded disabled. Keep live payments disabled until provider credentials, webhook verification, reconciliation, security and compliance are complete.
