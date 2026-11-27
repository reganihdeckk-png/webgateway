# QRIS merchant integration — GLASYPAY

## Merchant details read from the supplied image
- Merchant display name: GLASSY X PREMKU, Konter
- NMID: ID1026510716552
- Merchant code shown: A01
- QRIS type: static merchant QRIS (the supplied card does not show a per-transaction dynamic QR payload).

## Current app behavior
The Android app includes a QRIS information screen with the merchant details and an explicit warning. The original QR image has **not** been committed as a repository asset yet, so the app does not display a scannable code in this revision.

## Important payment limitations
A static QRIS image does not by itself provide a reliable transaction status callback to GLASYPAY. The app must not mark a deposit, wallet top-up, order, or invoice as paid merely because the QR screen was opened or the user says they paid.

Before enabling top-ups:
1. Confirm the merchant owns/authorizes this QRIS and that it is allowed to be used for the intended GLASYPAY flow.
2. Obtain a supported provider/acquirer integration or a merchant reconciliation feed with a documented verification method.
3. Match merchant identity, amount, transaction reference, and settlement status on the server.
4. Make crediting idempotent and post it through an audited, immutable double-entry ledger.
5. Test duplicate notifications, delayed settlement, reversals, refunds, and mismatched amounts.

Never put provider secrets or API keys in the Android app or public repository. Keep live payment processing disabled until server-side verification and required merchant/provider approvals are complete.
