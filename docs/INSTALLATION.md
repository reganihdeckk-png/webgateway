# GLASYPAY installation (development scaffold)

## Requirements
- Node.js LTS and npm
- Wrangler CLI and an authorized Cloudflare account for D1 operations
- Android Studio with a compatible Android SDK for the Android project
- PHP and Composer only if using the exploratory Laravel scaffold

## Cloudflare Worker
1. Enter `workers/api`.
2. Install dependencies with `npm install`.
3. Verify the D1 database ID and binding in `wrangler.toml`.
4. Apply migrations only after confirming the target database: `npx wrangler d1 migrations apply glasypay --local` for local development.
5. Run `npx wrangler dev`.

Do not run a remote migration or deploy until the account, database, and environment have been verified. Live payments remain disabled.

## Android
Open the `android` directory in Android Studio, allow Gradle sync, then run the app on an emulator. An APK has not yet been built or validated.

## Admin dashboard
Enter `admin-dashboard`, run `npm install`, then `npm run dev`. Production build validation remains outstanding.
