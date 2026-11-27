# Development Checklist

## Foundation
- [x] Project structure and architecture notes
- [x] Environment template without real credentials
- [x] Cloudflare Workers + D1 configuration scaffold
- [x] Initial D1 schema migration
- [x] Payment provider contract and disabled adapters
- [x] Ledger invariants documented
- [ ] Authenticate Wrangler and verify D1 database binding
- [ ] Verify Android Gradle build
- [ ] Verify dashboard production build

## Backend
- [ ] Complete authentication and authorization
- [ ] Implement double-entry posting with concurrency tests
- [ ] Implement merchant API authentication and hashed API keys
- [ ] Implement provider adapters and webhook signature verification
- [ ] Implement reconciliation and operational alerting

## Android and Admin
- [ ] Complete login/session and wallet flows
- [ ] Secure token storage and API integration
- [ ] Implement RBAC-protected admin pages and audit log viewer
- [ ] Add UI, integration and instrumentation tests

## Release gates
- [ ] Legal/compliance and provider merchant approval
- [ ] Independent security review
- [ ] Backup restore, load, reconciliation and disaster recovery tests
- [ ] Production secrets provisioned through a secret manager
