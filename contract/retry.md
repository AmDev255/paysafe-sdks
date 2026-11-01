# Retry and idempotency behaviour (every SDK)

Defaults: `maxRetries = 4` retries after the first attempt (5 attempts in total, matching the docs "loop up to 5 times"), `initialBackoff = 500 ms`, `maxBackoff = 8 s`, multiplier 2, full jitter (`random(0, backoff)`), `timeout = 30 s` per attempt.

## Decision table

| Outcome of an attempt | Action |
|---|---|
| 2xx | return |
| 409 `idempotency_in_progress` | sleep 1 s (not backoff), retry with the same key |
| 429 `rate_limited` | sleep `Retry-After` seconds (fallback: backoff), retry with the same key |
| 503 (`provider_unavailable`, `service_unavailable`) | sleep `Retry-After` seconds (fallback: backoff), retry with the same key |
| other 5xx (500, 502 `provider_error`) | retry with backoff only if the request is idempotent (see below); `provider_error` on createPayment is NOT retried automatically (docs say retry with a NEW key after a delay; that is the caller's decision) |
| network error / timeout | retry with backoff only if the request is idempotent |
| any other 4xx | raise immediately, no retry |

## Which requests are idempotent for retry purposes

- All `GET`, `DELETE`, `PATCH` requests.
- `POST` requests that carry an `Idempotency-Key` (createPayment, createRefund, createTransfer always; cancelPayment when the caller supplied one).
- `POST` without a key (createPaymentLink, createControlNumber, createWebhookEndpoint, cancelControlNumber, cancelPayment without key): network errors and 5xx are NOT retried (the request may have been applied). 429 and 503 are retried, because the docs state those never reach the handler.

## Idempotency-Key handling

- `payments.create`, `refunds.create`, `transfers.create` take `idempotencyKey` as a request option. If the caller omits it the SDK generates a UUID v4 once per logical call and reuses it for every retry of that call; the generated key is exposed on the response (`response.idempotencyKey`) so the caller can persist it. The SDK never generates a second key inside a retry loop.
- Validate 1–255 printable ASCII characters before sending.
- `Idempotent-Replayed: true` on the response sets `response.idempotentReplayed = true`.

## Headers on every request

- `Authorization: Bearer <key>`, `Accept: application/json`, `Content-Type: application/json` (only with a body), `User-Agent: paysafe-<lang>/<version> (<runtime>)`, `X-Request-ID` (caller-supplied or omitted), `PaySafe-Version` when configured.

## Observability

- Each response exposes `requestId`, `rateLimit {limit, remaining, reset}`, `idempotentReplayed`, raw `headers`, `statusCode`.
- Optional logger receives one line per attempt: method, path, status, duration, attempt number, request id. Never log the key or the body.
