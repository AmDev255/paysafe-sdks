# API coverage matrix

Source: `paysafe/docs/api/openapi.generated.json` version 2026-09-07. Cell values: Pending | Done | Via Node (the Next.js package re-exports the Node.js client, so operations are covered by paysafe-tz) | Planned (operation not served by the API; do not implement).
Update this file whenever an operation lands in an SDK. Generated 2026-11-01.

| Tag | Operation | Method | Path | Success | Idempotency-Key | PHP | Node.js | Next.js | Python | Go | Java | Kotlin | C# | Ruby | Dart |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Payments | createPayment | POST | `/v1/payments` | 202 | required | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payments | listPayments | GET | `/v1/payments` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payments | getPayment | GET | `/v1/payments/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payments | cancelPayment | POST | `/v1/payments/{id}/cancel` | 200 | optional | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payment links | createPaymentLink | POST | `/v1/payment-links` | 201 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payment links | listPaymentLinks | GET | `/v1/payment-links` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payment links | getPaymentLink | GET | `/v1/payment-links/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payment links | updatePaymentLink | PATCH | `/v1/payment-links/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Control numbers | createControlNumber | POST | `/v1/control-numbers` | 201 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Control numbers | listControlNumbers | GET | `/v1/control-numbers` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Control numbers | getControlNumber | GET | `/v1/control-numbers/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Control numbers | cancelControlNumber | POST | `/v1/control-numbers/{id}/cancel` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Refunds | createRefund | POST | `/v1/refunds` | 202 | required | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Refunds | listRefunds | GET | `/v1/refunds` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Refunds | getRefund | GET | `/v1/refunds/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Balance | getBalance | GET | `/v1/balance` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Balance | listTransactions | GET | `/v1/transactions` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Customers | listCustomers | GET | `/v1/customers` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Customers | getCustomer | GET | `/v1/customers/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Transfers | createTransfer | POST | `/v1/transfers` | 201 | required | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Transfers | listTransfers | GET | `/v1/transfers` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Transfers | getTransfer | GET | `/v1/transfers/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook endpoints | listWebhookEndpoints | GET | `/v1/webhook-endpoints` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook endpoints | createWebhookEndpoint | POST | `/v1/webhook-endpoints` | 201 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook endpoints | getWebhookEndpoint | GET | `/v1/webhook-endpoints/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook endpoints | updateWebhookEndpoint | PATCH | `/v1/webhook-endpoints/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook endpoints | deleteWebhookEndpoint | DELETE | `/v1/webhook-endpoints/{id}` | 204 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Events | listEvents | GET | `/v1/events` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Events | getEvent | GET | `/v1/events/{id}` | 200 | no | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Ping | ping | GET | `/v1/ping` | — | — | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned |
| Payouts | createPayout | POST | `/v1/payouts` | — | — | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned |
| Payouts | getPayout | GET | `/v1/payouts/{id}` | — | — | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned |
| Webhook endpoints | rotateWebhookEndpointSecret | POST | `/v1/webhook-endpoints/{id}/rotate-secret` | — | — | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned | Planned |

## Cross-cutting features (per SDK)

| Feature | PHP | Node.js | Next.js | Python | Go | Java | Kotlin | C# | Ruby | Dart |
|---|---|---|---|---|---|---|---|---|---|---|
| Client init + env from key prefix | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Configurable base URL / timeout / retries | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Error model (all codes) | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Retry loop per contract/retry.md | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Idempotency-Key handling | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| X-Request-ID + rate-limit info exposed | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Cursor pagination helper | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Payment/refund polling helper | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Webhook signature verification (+rotation) | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Typed models for all 23 schemas | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Async variant (where native) | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Logging hook | Done | Done | Via Node | Done | Done | Done | Done | Done | Done | Done |
| Unit tests | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Contract tests (shared fixtures) | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Network/timeout/429 tests | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Webhook tests | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Framework webhook examples | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| README 15 sections | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| CI workflow green | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |
| Package manifest validated (no publish) | Done | Done | Done | Done | Done | Done | Done | Done | Done | Done |

## Summary

Served operations: 29. Planned: 4. Schemas: 23.

## Evidence (2026-11-01)

| SDK | Repository | Latest CI run | Tests in the cross-language run |
|---|---|---|---|
| PHP | https://github.com/AmDev255/paysafe-php | https://github.com/AmDev255/paysafe-php/actions/runs/41336376559 | 165 tests, 1950 assertions |
| Node.js | https://github.com/AmDev255/paysafe-node | https://github.com/AmDev255/paysafe-node/actions/runs/41336364957 | 149 tests (8 files) |
| Next.js | https://github.com/AmDev255/paysafe-nextjs | https://github.com/AmDev255/paysafe-nextjs/actions/runs/41338929207 | 15 tests (2 files) |
| Python | https://github.com/AmDev255/paysafe-python | https://github.com/AmDev255/paysafe-python/actions/runs/41336591411 | 154 passed |
| Go | https://github.com/AmDev255/paysafe-go | https://github.com/AmDev255/paysafe-go/actions/runs/41336396963 | go test ok |
| Java | https://github.com/AmDev255/paysafe-java | https://github.com/AmDev255/paysafe-java/actions/runs/41336409622 | 146 tests |
| Kotlin | https://github.com/AmDev255/paysafe-kotlin | https://github.com/AmDev255/paysafe-kotlin/actions/runs/41336421066 | 42 tests |
| .NET | https://github.com/AmDev255/paysafe-dotnet | https://github.com/AmDev255/paysafe-dotnet/actions/runs/41336639834 | 154 passed |
| Ruby | https://github.com/AmDev255/paysafe-ruby | https://github.com/AmDev255/paysafe-ruby/actions/runs/41336445232 | 111 examples |
| Dart | https://github.com/AmDev255/paysafe-dart | https://github.com/AmDev255/paysafe-dart/actions/runs/41336453475 | 111 tests, pub dry-run 0 warnings |

Each run above includes the five live sandbox tests (balance, payment lifecycle with a succeeded and a declined payment, validation and not-found errors, webhook endpoint round trip, events and customers). Full logs: `reports/logs/<repo>.log`; summary: `reports/contract-2026-11-01.md`.
