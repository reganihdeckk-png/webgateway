# Manual QRIS payment review workflow

This repository implements the database foundation and dashboard prototype for manual QRIS proof review.

## Intended flow
1. A customer creates an order/payment request with a unique order reference and fixed IDR amount.
2. The app shows the merchant's static QRIS. Customer pays using their banking/e-wallet app and enters the bank/payment reference.
3. Customer submits proof and the order reference. Submission is stored as `pending_review`.
4. An authorized admin checks the actual incoming payment in the DANA Bisnis merchant transaction history, matching merchant, amount, time, and reference where available.
5. Admin records approve/reject/needs-information with a note. The decision and actor are audit logged.
6. The customer sees the decision and order fulfilment status.

## Important controls
- A screenshot or customer claim is not proof of settlement by itself.
- Static QRIS does not send an automatic payment callback to this app.
- Approval must not be exposed through an unauthenticated endpoint.
- Never accept a client-side `paid=true` flag.
- Do not credit wallet balances or release funds based only on this manual-review record. Any wallet/funds functionality needs a separately reviewed, balanced ledger flow and proper merchant/payment-provider arrangements.
- Store proof images in private object storage; keep only an opaque object key in D1. Never store public proof URLs.
- Admin authentication, role authorization, CSRF protections, rate limits, malware/content checks, privacy retention and audit review must be implemented before real customer use.

## Current implementation status
- D1 schema migration: implemented.
- Admin page: workflow prototype only; no live submissions or approve/reject API is connected.
- Android: merchant information panel only; the supplied QR image is not yet packaged as a scannable app asset.
- Live payment processing and automatic wallet crediting: disabled.
