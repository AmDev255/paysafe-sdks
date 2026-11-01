# Webhook verification (every SDK)

Headers on a delivery: `PaySafe-Signature: t=<unix seconds>,v1=<hex>[,v1=<hex>]`, `PaySafe-Event-Id` (evt_), `PaySafe-Delivery-Id` (whd_), `PaySafe-Attempt` (1-based), `Content-Type: application/json`, `User-Agent: PaySafe-Webhooks/1.0`.

Algorithm (from the Webhooks page, verified against `packages/core/src/infra/security/index.ts`):
1. Parse the header by splitting on `,`, then each part on the first `=`. Collect `t` (one) and every `v1` (one or more; two during a 24 h secret rotation). Missing or non-numeric `t`, or no `v1` → invalid.
2. Reject if `|now − t| > tolerance` (default 300 s; configurable; `now` injectable for tests).
3. Expected = hex(HMAC-SHA256(secret, `${t}.${rawBody}`)). `rawBody` is the exact bytes received; never re-serialise JSON.
4. Accept if ANY `v1` equals expected using a constant-time comparison. (The platform reference implementation currently compares only the last `v1`; see doc-gaps G5. SDKs follow the documented behaviour.)

## SDK API

- `webhooks.verifySignature(secret, rawBody, signatureHeader, { tolerance = 300, now? })` → boolean. Never throws for bad input.
- `webhooks.constructEvent(secret, rawBody, signatureHeader, { tolerance, now })` → typed `Event`; throws `SignatureVerificationError` with a reason (`missing_header`, `malformed_header`, `timestamp_outside_tolerance`, `signature_mismatch`) and never includes the secret in the message.
- `webhooks.sign(secret, rawBody, timestamp)` → header value, for tests only (documented as such).
- Multiple secrets: `verifySignature([secretA, secretB], …)` accepts an array so callers can rotate on their side too.
- Guidance in every README: respond 2xx quickly, verify before parsing, deduplicate by `PaySafe-Event-Id` / `event.id`, events may arrive out of order (compare `created_at` or re-fetch the object with `events.get` / `payments.get`), `request` field is absent until it ships, check `livemode`.

## Test vector (contract/fixtures/webhook-vector.json)

- secret: `paysafe_webhook_test_2f4c9b7e1a3d5f6c8e0b2a4d6f8c1e3b` (the secret shown on the docs page once brand placeholders are rendered)
- timestamp: `1788775204`
- body (exact bytes, no trailing newline): see fixture
- signature: `250d2673fee3d9c3398fe15a37c9bcb230d87f80c5441e5b83fd43c7f2d7995b`
- The docs page currently prints `880ac7fb8a4bb2ddbd615706ebabde6dbd040552d546b830c5a696e7b23b3d08`, which corresponds to secret `whsec_test_2f4c…`; the docs are corrected in S12 (doc-gaps G4). The fixture also carries that legacy pair so SDK tests can prove both.

Required tests per SDK: valid signature; wrong secret; modified body (one byte); missing header; malformed header; timestamp outside tolerance (both directions); two `v1` entries where only the second matches; array of secrets; constructEvent returns typed Event with `type`, `data.object`, `livemode`.
