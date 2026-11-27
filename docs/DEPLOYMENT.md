# GLASSY STORE deployment

## Cloudflare Worker API

The repository includes `.github/workflows/deploy-cloudflare.yml` to deploy the API Worker with GitHub Actions.

### One-time GitHub setup

1. In Cloudflare, create an API token scoped to the intended account with **Workers Scripts: Edit**, **D1: Edit**, and **Account Settings: Read** permissions. Limit the token to the required account where possible.
2. Copy the Cloudflare account ID from the Cloudflare dashboard.
3. In GitHub, open this repository's **Settings → Secrets and variables → Actions**.
4. Add these repository secrets:
   - `CLOUDFLARE_API_TOKEN`: the Cloudflare API token. Never commit or paste it into source files.
   - `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.
5. Merge the deployment workflow to `main` to enable automatic deployment on relevant pushes to `main`.

### Deploy manually

1. Open the repository's **Actions** tab.
2. Select **Deploy GLASSY STORE API to Cloudflare**.
3. Choose **Run workflow** and select the branch to run.
4. Leave **Apply pending D1 migrations** unchecked for a normal Worker deployment.
5. Enable that option only after reviewing the SQL migration files and confirming the target D1 database.

The workflow checks the Worker TypeScript, optionally applies pending migrations to the remote D1 database named `yuss`, and deploys the Worker. Pushes to `main` deploy the Worker without automatically applying database migrations.

### D1 database

The Worker configuration is already set to:

- Database name: `yuss`
- Database ID: `fb7c3e0f-eab6-4bcf-8345-a7feb367aece`

Review the SQL files under `migrations/` before applying them to production. The workflow's migration step is opt-in and only runs when manually requested.

### Storefront

The Next.js app lives in `web/` and is a separate deployment target from the API Worker. It is not deployed by the Worker workflow. Configure a compatible Cloudflare Next.js deployment (including the OpenNext Cloudflare adapter and its build settings) separately, then set `NEXT_PUBLIC_API_BASE_URL` to the deployed Worker URL.

## Remaining production work

- Configure the GitHub repository secrets and run the workflow; no Cloudflare credentials are stored in this repository.
- Deploy the Next.js storefront separately.
- Set the Worker `ALLOWED_ORIGIN` variable to the exact production storefront origin.
- Verify `/api/health`, `/api/categories`, and product endpoints after deployment.
- Configure custom domain, HTTPS, monitoring, backups, and rate limits.
- Rotate supplier credentials previously pasted into chat. Store replacement values only as Worker secrets after verifying official supplier authentication documentation.
- Premku authentication mode and endpoint paths are not yet verified.
- No payment provider has been configured or verified. Do not accept real payments until payment creation, callback signature verification, idempotency, reconciliation, and refund handling are implemented and tested.
- Email verification, password reset, and full order/deposit administration are not yet active.
