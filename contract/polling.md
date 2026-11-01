# Polling helpers and lifecycle (every SDK)

`202 Accepted` on createPayment/createRefund means "accepted", not "paid". The outcome arrives by webhook (preferred) or polling. Helpers exist for callers who cannot receive webhooks.

## Terminal states

| Resource | Non-terminal | Terminal |
|---|---|---|
| Payment | created, pending, processing, requires_action | succeeded, failed, cancelled, expired, partially_refunded, refunded |
| Refund | pending, processing | succeeded, failed, rejected |
| Transfer | in_review | completed, rejected, reversed |
| Control number | active | paid, expired, cancelled |
| Payment link | active, paused | archived |

## Helper signature

`payments.waitForTerminal(id, { interval = 2 s, timeout = 120 s, cancel? , onUpdate? })` → Payment
`refunds.waitForTerminal(id, { interval = 1 s, timeout = 60 s, … })` → Refund
`transfers.waitForTerminal(id, { interval = 2 s, timeout = 120 s, … })` → Transfer

Behaviour:
- First GET immediately, then every `interval` (minimum 500 ms, enforced). Back off to 5 s after 30 s to respect rate limits.
- `onUpdate(object)` fires on every status change.
- `timeout` reached → raise `PollingTimeoutError` (subclass of PaySafeError) carrying the last object seen. Never return a non-terminal object silently.
- `cancel` (AbortSignal / CancellationToken / context.Context / callable) stops the loop and raises the language's cancellation error.
- Rate-limit errors inside the loop are retried by the normal retry policy; any other ApiError propagates.
- Async variants where native (`await client.payments.waitForTerminal(...)`).

## Status helpers on models

`payment.isTerminal`, `payment.isSuccessful` (succeeded, partially_refunded, refunded), `refund.isTerminal`, etc.
