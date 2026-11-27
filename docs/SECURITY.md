# Security baseline and release blockers

- Store password hashes using a modern password-hashing function; never store plaintext passwords.
- Store refresh tokens and merchant API keys only as hashes.
- Enforce authorization on every user, merchant and admin endpoint.
- Use idempotency keys and atomic, balanced double-entry ledger postings.
- Treat ledger entries as immutable; use compensating entries for reversals.
- Verify provider webhook signatures and event replay protection before processing events.
- Keep provider secrets in a secret manager, never in source control or client apps.
- Apply rate limits, request validation, audit logging, TLS, backups and monitoring.
- Complete independent security and compliance review before production.

The current repository is a scaffold and does not yet implement these controls end-to-end.
