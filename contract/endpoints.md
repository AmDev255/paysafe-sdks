# Endpoint inventory

Generated from `contract/openapi.json` (API version 2026-09-07) by `tools/gen-endpoints.mjs`. Do not edit by hand.

Base URL `https://api.paysafe.co.tz`. Auth: `Authorization: Bearer <secret key>` on every operation. `*` marks a required field. Every operation can also return 400 validation_error, 401 authentication_error, 403 permission_error/feature_disabled, 404 not_found, 409 conflict family, 429 rate_limited, 503 (see errors.md).

## Summary

| # | operationId | Method | Path | Scope | Success | Idempotency-Key | Paginated |
|---|---|---|---|---|---|---|---|
| 1 | createPayment | POST | `/v1/payments` | payments:write | 202 | required | no |
| 2 | listPayments | GET | `/v1/payments` | payments:read | 200 | no | yes |
| 3 | getPayment | GET | `/v1/payments/{id}` | payments:read | 200 | no | no |
| 4 | cancelPayment | POST | `/v1/payments/{id}/cancel` | payments:write | 200 | optional | no |
| 5 | createPaymentLink | POST | `/v1/payment-links` | payments:write | 201 | no | no |
| 6 | listPaymentLinks | GET | `/v1/payment-links` | payments:read | 200 | no | yes |
| 7 | getPaymentLink | GET | `/v1/payment-links/{id}` | payments:read | 200 | no | no |
| 8 | updatePaymentLink | PATCH | `/v1/payment-links/{id}` | payments:write | 200 | no | no |
| 9 | createControlNumber | POST | `/v1/control-numbers` | payments:write | 201 | no | no |
| 10 | listControlNumbers | GET | `/v1/control-numbers` | payments:read | 200 | no | yes |
| 11 | getControlNumber | GET | `/v1/control-numbers/{id}` | payments:read | 200 | no | no |
| 12 | cancelControlNumber | POST | `/v1/control-numbers/{id}/cancel` | payments:write | 200 | no | no |
| 13 | createRefund | POST | `/v1/refunds` | refunds:write | 202 | required | no |
| 14 | listRefunds | GET | `/v1/refunds` | refunds:read | 200 | no | yes |
| 15 | getRefund | GET | `/v1/refunds/{id}` | refunds:read | 200 | no | no |
| 16 | getBalance | GET | `/v1/balance` | balance:read | 200 | no | no |
| 17 | listTransactions | GET | `/v1/transactions` | balance:read | 200 | no | yes |
| 18 | listCustomers | GET | `/v1/customers` | customers:read | 200 | no | yes |
| 19 | getCustomer | GET | `/v1/customers/{id}` | customers:read | 200 | no | no |
| 20 | createTransfer | POST | `/v1/transfers` | transfers:write | 201 | required | no |
| 21 | listTransfers | GET | `/v1/transfers` | transfers:read | 200 | no | yes |
| 22 | getTransfer | GET | `/v1/transfers/{id}` | transfers:read | 200 | no | no |
| 23 | listWebhookEndpoints | GET | `/v1/webhook-endpoints` | webhooks:read | 200 | no | no |
| 24 | createWebhookEndpoint | POST | `/v1/webhook-endpoints` | webhooks:write | 201 | no | no |
| 25 | getWebhookEndpoint | GET | `/v1/webhook-endpoints/{id}` | webhooks:read | 200 | no | no |
| 26 | updateWebhookEndpoint | PATCH | `/v1/webhook-endpoints/{id}` | webhooks:write | 200 | no | no |
| 27 | deleteWebhookEndpoint | DELETE | `/v1/webhook-endpoints/{id}` | webhooks:write | 204 | no | no |
| 28 | listEvents | GET | `/v1/events` | events:read | 200 | no | yes |
| 29 | getEvent | GET | `/v1/events/{id}` | events:read | 200 | no | no |

## Operations

### createPayment

`POST /v1/payments` — Create a payment

Starts a mobile-money charge. Returns 202 with status pending; the final state arrives by webhook or by polling GET /v1/payments/{id}. Requires scope payments:write.

Scope: `payments:write`. Tag: Payments.

Parameters (header):
- `Idempotency-Key`*: string len 0..255 — Unique key per logical request; same key + same body replays the original response, same key + different body returns 409 idempotency_conflict.
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- amount*: integer [1000..10000000]
- currency: `TZS`
- customer*: object{phone, name, email}
- customer.phone*: string
- customer.name: string len 1..100
- customer.email: string(email) len 0..255
- reference: string len 1..120
- description: string len 1..255
- metadata: object
- expires_in: integer [60..900]
- channel: `mpesa` \| `tigopesa` \| `airtel` \| `halopesa`

Responses:
- 202: Payment accepted for processing → Payment
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listPayments

`GET /v1/payments` — List payments

Scope: `payments:read`. Tag: Payments.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `status`: `created` \| `pending` \| `processing` \| `requires_action` \| `succeeded` \| `failed` \| `cancelled` \| `expired` \| `partially_refunded` \| `refunded` \| string
- `reference`: string len 0..120
- `customer_phone`: string
- `created_gte`: any
- `created_lte`: any

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of payments → PaymentList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getPayment

`GET /v1/payments/{id}` — Retrieve a payment

Scope: `payments:read`. Tag: Payments.

Parameters (path):
- `id`*: string — Payment id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The payment → Payment
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### cancelPayment

`POST /v1/payments/{id}/cancel` — Cancel a payment

Only payments in created or pending can be cancelled. Later states return 409 invalid_state.

Scope: `payments:write`. Tag: Payments.

Parameters (path):
- `id`*: string — Payment id

Parameters (header):
- `Idempotency-Key`: string len 0..255 — Unique key per logical request; same key + same body replays the original response, same key + different body returns 409 idempotency_conflict.
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json):
- reason: string len 0..255

Responses:
- 200: The cancelled payment → Payment
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### createPaymentLink

`POST /v1/payment-links` — Create a payment link

Returns a hosted payment page address to share with a customer. Each payment made through the link is an ordinary payment: it carries the link id in payment_link and emits the usual payment webhooks. Requires scope payments:write.

Scope: `payments:write`. Tag: Payment links.

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- title*: string len 2..120
- description: string len 1..1000
- amount: integer [1000..10000000]
- min_amount: integer [1000..10000000]
- max_amount: integer [1000..10000000]
- currency: `TZS`
- collect_name: boolean
- collect_email: boolean
- max_payments: integer [1..1000000]
- expires_at: string(date-time)
- success_message: string len 1..255
- redirect_url: string(uri) len 0..500
- logo: string len 0..240
- accent_color: string

Responses:
- 201: Link created → PaymentLink
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listPaymentLinks

`GET /v1/payment-links` — List payment links

Scope: `payments:read`. Tag: Payment links.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `status`: `active` \| `paused` \| `archived`

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of payment links → PaymentLinkList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getPaymentLink

`GET /v1/payment-links/{id}` — Retrieve a payment link

Scope: `payments:read`. Tag: Payment links.

Parameters (path):
- `id`*: string — Payment link id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The payment link → PaymentLink
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### updatePaymentLink

`PATCH /v1/payment-links/{id}` — Update a payment link

Pause, resume, archive or edit a link. The amount cannot be changed. Archiving is permanent.

Scope: `payments:write`. Tag: Payment links.

Parameters (path):
- `id`*: string — Payment link id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- title: string len 2..120
- description: string len 1..1000 nullable
- max_payments: integer [1..1000000] nullable
- expires_at: string(date-time) nullable
- status: `active` \| `paused` \| `archived`
- success_message: string len 1..255 nullable
- redirect_url: string(uri) len 0..500 nullable
- collect_name: boolean
- collect_email: boolean
- logo: string len 0..240 nullable
- accent_color: string nullable

Responses:
- 200: The payment link → PaymentLink
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### createControlNumber

`POST /v1/control-numbers` — Create a control number

Issues a 12-digit pay-by-reference number for something a customer owes. The number comes only from the server. Returns 201 with the number and its hosted pay page. Requires scope payments:write and the control-numbers feature on the project (404 feature_disabled otherwise); 409 limit_reached when the project's open-number limit is hit; 400 image_invalid when image does not name an uploaded JPEG, PNG or WebP.

Scope: `payments:write`. Tag: Control numbers.

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- payer_name*: string len 1..120 — Who owes the money. Printed on the receipt; the pay page shows initials only.
- payer_phone: string len 0..20 — Tanzanian mobile number, local or E.164. Receives the number and receipts by SMS.
- payer_email: string(email) len 0..255
- payer_reference: string len 0..120 — Your own id for the payer: a student number, tenant id or account number.
- title*: string len 1..150 — What the payment is for. Shown on the pay page and the receipt.
- description: string len 0..500
- reference: string len 0..120 — Your invoice or document number.
- payment_type: string len 0..60 — Groups numbers in reports and exports, for example fees or rent.
- mode: `full` \| `instalment` — full: one payment of the whole balance. instalment: any number of payments until the balance is zero.
- amount*: integer [1..1000000000000]
- currency: `TZS`
- expires_at: string len 0..40 — RFC 3339 instant, or YYYY-MM-DD for the end of that day in Tanzania. Must be in the future.
- notes: string len 0..1000 — Internal notes. Never shown to the payer.
- instalments: array<object{amount, due_at}> — Optional schedule for instalment mode: due dates in order, amounts adding up to amount.
- metadata: object — Up to 8 KB of your own JSON, returned unchanged.
- image: string len 0..240 — Storage key of an image uploaded from the dashboard (the image field of a number or batch created there). There is no upload endpoint in the API yet.

Responses:
- 201: Control number issued → ControlNumber
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listControlNumbers

`GET /v1/control-numbers` — List control numbers

Newest first, for the key's project and environment. Requires scope payments:read.

Scope: `payments:read`. Tag: Control numbers.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `status`: `active` \| `paid` \| `expired` \| `cancelled`
- `state`: `unpaid` \| `partial` \| `paid` \| `overdue`
- `batch`: string
- `customer`: string
- `q`: string len 0..80

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of control numbers → ControlNumberList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getControlNumber

`GET /v1/control-numbers/{id}` — Retrieve a control number

The number with every payment entry on it: hosted-page payments and payments recorded on the dashboard, including pending and reversed ones. Requires scope payments:read.

Scope: `payments:read`. Tag: Control numbers.

Parameters (path):
- `id`*: string — Control number id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The control number and its entries → ControlNumberWithEntries
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### cancelControlNumber

`POST /v1/control-numbers/{id}/cancel` — Cancel a control number

The payer can no longer pay the number and it cannot be reopened; verified payments stay on record. Only active numbers can be cancelled: others return 409 invalid_state. Requires scope payments:write.

Scope: `payments:write`. Tag: Control numbers.

Parameters (path):
- `id`*: string — Control number id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- reason*: string len 3..500 — Kept on the number and shown on the dashboard.

Responses:
- 200: The cancelled control number → ControlNumber
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### createRefund

`POST /v1/refunds` — Create a refund

Scope: `refunds:write`. Tag: Refunds.

Parameters (header):
- `Idempotency-Key`*: string len 0..255 — Unique key per logical request; same key + same body replays the original response, same key + different body returns 409 idempotency_conflict.
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- payment*: string
- amount: integer [1..9007199254740991]
- reason: `requested_by_customer` \| `duplicate` \| `fraudulent` \| `other`
- metadata: object

Responses:
- 202: Refund accepted → Refund
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listRefunds

`GET /v1/refunds` — List refunds

Scope: `refunds:read`. Tag: Refunds.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `payment`: string
- `status`: `pending` \| `processing` \| `succeeded` \| `failed` \| `rejected`

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of refunds → RefundList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getRefund

`GET /v1/refunds/{id}` — Retrieve a refund

Scope: `refunds:read`. Tag: Refunds.

Parameters (path):
- `id`*: string — Refund id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The refund → Refund
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getBalance

`GET /v1/balance` — Retrieve the project balance

Scope: `balance:read`. Tag: Balance.

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: Available and pending balances → Balance
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listTransactions

`GET /v1/transactions` — List balance transactions

Scope: `balance:read`. Tag: Balance.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of ledger entries → TransactionList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listCustomers

`GET /v1/customers` — List customers

Scope: `customers:read`. Tag: Customers.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `search`: string len 2..60

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of customers → CustomerList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getCustomer

`GET /v1/customers/{id}` — Retrieve a customer

Scope: `customers:read`. Tag: Customers.

Parameters (path):
- `id`*: string — Customer id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The customer → Customer
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### createTransfer

`POST /v1/transfers` — Send a transfer

Moves money from this project's available balance to another PaySafe project, with no fee. Returns 201 with status completed, or in_review when the amount needs a staff review first. Requires the opt-in scope transfers:write.

Scope: `transfers:write`. Tag: Transfers.

Parameters (header):
- `Idempotency-Key`*: string len 0..255 — Unique key per logical request; same key + same body replays the original response, same key + different body returns 409 idempotency_conflict.
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- to*: string len 3..31
- amount*: integer [1..9007199254740991]
- currency: `TZS`
- note: string len 0..140

Responses:
- 201: Transfer created → Transfer
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listTransfers

`GET /v1/transfers` — List transfers

Transfers sent and received by this project. Requires scope transfers:read.

Scope: `transfers:read`. Tag: Transfers.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of transfers → TransferList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getTransfer

`GET /v1/transfers/{id}` — Retrieve a transfer

Scope: `transfers:read`. Tag: Transfers.

Parameters (path):
- `id`*: string — Transfer id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The transfer → Transfer
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listWebhookEndpoints

`GET /v1/webhook-endpoints` — List webhook endpoints

Scope: `webhooks:read`. Tag: Webhook endpoints.

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: Endpoints → WebhookEndpointList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### createWebhookEndpoint

`POST /v1/webhook-endpoints` — Create a webhook endpoint

The signing secret is returned once in this response only.

Scope: `webhooks:write`. Tag: Webhook endpoints.

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- url*: string(uri) len 8..500
- description: string len 0..255
- events: array<`*`> \| array<`payment.pending` \| `payment.processing` \| `payment.requires_action` \| `payment.succeeded` \| `payment.failed` \| `payment.expired` \| `payment.cancelled` \| `refund.pending` \| `refund.succeeded` \| `refund.failed` \| `payout.processing` \| `payout.paid` \| `payout.failed` \| `transfer.sent` \| `transfer.received` \| `transfer.in_review` \| `transfer.rejected` \| `transfer.reversed` \| `control_number.partially_paid` \| `control_number.paid` \| `control_number.expired` \| `control_number.cancelled`>

Responses:
- 201: Endpoint created → WebhookEndpointCreated
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getWebhookEndpoint

`GET /v1/webhook-endpoints/{id}` — Retrieve a webhook endpoint

Scope: `webhooks:read`. Tag: Webhook endpoints.

Parameters (path):
- `id`*: string — Endpoint id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The endpoint → WebhookEndpoint
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### updateWebhookEndpoint

`PATCH /v1/webhook-endpoints/{id}` — Update a webhook endpoint

Scope: `webhooks:write`. Tag: Webhook endpoints.

Parameters (path):
- `id`*: string — Endpoint id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Request body (application/json), required:
- url: string(uri) len 8..500
- description: string len 0..255 nullable
- events: array<`*`> \| array<`payment.pending` \| `payment.processing` \| `payment.requires_action` \| `payment.succeeded` \| `payment.failed` \| `payment.expired` \| `payment.cancelled` \| `refund.pending` \| `refund.succeeded` \| `refund.failed` \| `payout.processing` \| `payout.paid` \| `payout.failed` \| `transfer.sent` \| `transfer.received` \| `transfer.in_review` \| `transfer.rejected` \| `transfer.reversed` \| `control_number.partially_paid` \| `control_number.paid` \| `control_number.expired` \| `control_number.cancelled`>
- status: `ENABLED` \| `DISABLED`

Responses:
- 200: The endpoint → WebhookEndpoint
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### deleteWebhookEndpoint

`DELETE /v1/webhook-endpoints/{id}` — Delete a webhook endpoint

Scope: `webhooks:write`. Tag: Webhook endpoints.

Parameters (path):
- `id`*: string — Endpoint id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 204: Deleted
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### listEvents

`GET /v1/events` — List events

Scope: `events:read`. Tag: Events.

Parameters (query):
- `limit`: integer [1..100]
- `cursor`: string len 0..200
- `type`: `payment.pending` \| `payment.processing` \| `payment.requires_action` \| `payment.succeeded` \| `payment.failed` \| `payment.expired` \| `payment.cancelled` \| `refund.pending` \| `refund.succeeded` \| `refund.failed` \| `payout.processing` \| `payout.paid` \| `payout.failed` \| `transfer.sent` \| `transfer.received` \| `transfer.in_review` \| `transfer.rejected` \| `transfer.reversed` \| `control_number.partially_paid` \| `control_number.paid` \| `control_number.expired` \| `control_number.cancelled`
- `from`: any
- `to`: any
- `resourceId`: string len 0..32

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: A page of events → EventList
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

### getEvent

`GET /v1/events/{id}` — Retrieve an event with its deliveries

Scope: `events:read`. Tag: Events.

Parameters (path):
- `id`*: string — Event id

Parameters (header):
- `X-Request-ID`: string — Client-supplied correlation id; echoed back and shown in the dashboard request log.

Responses:
- 200: The event → EventWithDeliveries
- 400: Validation error → Error
- 401: Missing or invalid API key → Error
- 403: Key lacks the required scope, or live mode is not enabled → Error
- 404: Not found → Error
- 409: Idempotency conflict or invalid state → Error
- 429: Rate limited → Error
- 503: Provider or service temporarily unavailable; retry with backoff → Error

## Schemas

### Error

- error*: object{code, message, request_id, param, details}
- error.code*: `validation_error` \| `authentication_error` \| `permission_error` \| `not_found` \| `conflict` \| `idempotency_conflict` \| `idempotency_in_progress` \| `invalid_state` \| `rate_limited` \| `insufficient_funds` \| `provider_unavailable` \| `provider_error` \| `feature_disabled` \| `amount_out_of_range` \| `daily_limit_reached` \| `project_too_new` \| `recipient_not_found` \| `link_unavailable` \| `limit_reached` \| `image_invalid` \| `service_unavailable` \| `internal_error`
- error.message*: string
- error.request_id*: string
- error.param: string
- error.details: object

### Payment

- id*: string
- object*: `payment`
- status*: `created` \| `pending` \| `processing` \| `requires_action` \| `succeeded` \| `failed` \| `cancelled` \| `expired` \| `partially_refunded` \| `refunded`
- amount*: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- currency*: `TZS`
- amount_refunded*: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- fee*: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- net*: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- customer*: object{phone, name, email}
- customer.phone*: string
- customer.name*: string nullable
- customer.email*: string nullable
- channel*: string nullable
- reference*: string nullable
- description*: string nullable
- payment_link*: string nullable — The payment link this payment was made through, if any.
- metadata*: object
- failure*: object{code, message}
- failure.code*: string nullable
- failure.message*: string nullable
- livemode*: boolean
- expires_at*: string(date-time) nullable
- succeeded_at*: string(date-time) nullable
- created_at*: string(date-time)
- updated_at*: string(date-time)

### PaymentList

- object*: `list`
- data*: array<object{id, object, status, amount, currency, amount_refunded, fee, net, customer, channel, reference, description, payment_link, metadata, failure, livemode, expires_at, succeeded_at, created_at, updated_at}>
- has_more*: boolean
- next_cursor*: string nullable

### PaymentLink

- id*: string
- object*: `payment_link`
- url*: string(uri) — The hosted payment page to share with the customer.
- title*: string
- description*: string nullable
- amount_type*: `fixed` \| `customer`
- amount*: integer [-9007199254740991..9007199254740991] nullable
- min_amount*: integer [-9007199254740991..9007199254740991] nullable
- max_amount*: integer [-9007199254740991..9007199254740991] nullable
- currency*: `TZS`
- collect_name*: boolean
- collect_email*: boolean
- max_payments*: integer [-9007199254740991..9007199254740991] nullable
- paid_count*: integer [-9007199254740991..9007199254740991]
- paid_amount*: integer [-9007199254740991..9007199254740991]
- expires_at*: string(date-time) nullable
- status*: `active` \| `paused` \| `archived`
- state*: `active` \| `paused` \| `archived` \| `expired` \| `completed` — What a customer sees: an active link can still be expired or fully used.
- success_message*: string nullable
- redirect_url*: string nullable
- logo*: string nullable
- logo_url*: string(uri) nullable — Where the logo is served from.
- accent_color*: string nullable
- livemode*: boolean
- created_at*: string(date-time)
- updated_at*: string(date-time)

### PaymentLinkList

- object*: `list`
- data*: array<object{id, object, url, title, description, amount_type, amount, min_amount, max_amount, currency, collect_name, collect_email, max_payments, paid_count, paid_amount, expires_at, status, state, success_message, redirect_url, logo, logo_url, accent_color, livemode, created_at, updated_at}>
- has_more*: boolean
- next_cursor*: string nullable

### ControlNumber

- id*: string
- object*: `control_number`
- number*: string — The twelve digits, no spaces.
- formatted*: string — The number in groups of four, as people read it.
- batch*: string nullable — The batch this number was issued in, if any.
- customer*: string nullable — The customer the payer matched or created, by phone.
- payer*: object{name, phone, email, reference}
- payer.name*: string
- payer.phone*: string nullable
- payer.email*: string nullable
- payer.reference*: string nullable
- title*: string
- description*: string nullable
- reference*: string nullable
- payment_type*: string nullable
- mode*: `full` \| `instalment`
- amount*: integer [-9007199254740991..9007199254740991]
- paid_amount*: integer [-9007199254740991..9007199254740991]
- balance*: integer [-9007199254740991..9007199254740991] — amount minus paid_amount, never below zero.
- progress_percent*: integer [0..100]
- currency*: `TZS`
- payment_count*: integer [-9007199254740991..9007199254740991] — Verified payments on the number.
- status*: `active` \| `paid` \| `expired` \| `cancelled`
- payment_status*: `unpaid` \| `partially_paid` \| `fully_paid` \| `overdue` \| `expired` \| `expired_partially_paid` \| `cancelled`
- notes*: string nullable
- metadata*: object nullable
- issued_at*: string(date-time)
- expires_at*: string(date-time) nullable
- paid_at*: string(date-time) nullable — Set once, when the balance first reaches zero.
- last_paid_at*: string(date-time) nullable
- cancelled_at*: string(date-time) nullable
- cancel_reason*: string nullable
- pay_url*: string(uri) — The hosted pay page. Put this in invoices and messages.
- livemode*: boolean
- image*: string nullable — Storage key of the image, reusable in image when creating another number.
- image_url*: string(uri) nullable — Where the image is served from.
- created_at*: string(date-time)

### ControlNumberList

- object*: `list`
- data*: array<object{id, object, number, formatted, batch, customer, payer, title, description, reference, payment_type, mode, amount, paid_amount, balance, progress_percent, currency, payment_count, status, payment_status, notes, metadata, issued_at, expires_at, paid_at, last_paid_at, cancelled_at, cancel_reason, pay_url, livemode, image, image_url, created_at}>
- has_more*: boolean
- next_cursor*: string nullable

### ControlNumberEntry

- id*: string
- object*: `control_number_entry`
- control_number*: string
- source*: `payment` \| `manual` — payment: made on the hosted pay page. manual: recorded on the dashboard.
- payment*: string nullable — The payment behind a hosted-page entry.
- amount*: integer [-9007199254740991..9007199254740991]
- currency*: `TZS`
- method*: string — BANK_TRANSFER, CASH, or MOBILE_MONEY:<network> for hosted payments.
- provider_reference*: string nullable
- paid_at*: string(date-time)
- status*: `pending` \| `verified` \| `rejected` \| `reversed` — Only verified entries count towards the balance.
- receipt_number*: string nullable
- recorded_by*: string nullable
- verified_by*: string nullable
- verified_at*: string(date-time) nullable
- rejected_at*: string(date-time) nullable
- reject_reason*: string nullable
- reversed_at*: string(date-time) nullable
- reverse_reason*: string nullable
- note*: string nullable
- created_at*: string(date-time)

### ControlNumberWithEntries

- id*: string
- object*: `control_number`
- number*: string — The twelve digits, no spaces.
- formatted*: string — The number in groups of four, as people read it.
- batch*: string nullable — The batch this number was issued in, if any.
- customer*: string nullable — The customer the payer matched or created, by phone.
- payer*: object{name, phone, email, reference}
- payer.name*: string
- payer.phone*: string nullable
- payer.email*: string nullable
- payer.reference*: string nullable
- title*: string
- description*: string nullable
- reference*: string nullable
- payment_type*: string nullable
- mode*: `full` \| `instalment`
- amount*: integer [-9007199254740991..9007199254740991]
- paid_amount*: integer [-9007199254740991..9007199254740991]
- balance*: integer [-9007199254740991..9007199254740991] — amount minus paid_amount, never below zero.
- progress_percent*: integer [0..100]
- currency*: `TZS`
- payment_count*: integer [-9007199254740991..9007199254740991] — Verified payments on the number.
- status*: `active` \| `paid` \| `expired` \| `cancelled`
- payment_status*: `unpaid` \| `partially_paid` \| `fully_paid` \| `overdue` \| `expired` \| `expired_partially_paid` \| `cancelled`
- notes*: string nullable
- metadata*: object nullable
- issued_at*: string(date-time)
- expires_at*: string(date-time) nullable
- paid_at*: string(date-time) nullable — Set once, when the balance first reaches zero.
- last_paid_at*: string(date-time) nullable
- cancelled_at*: string(date-time) nullable
- cancel_reason*: string nullable
- pay_url*: string(uri) — The hosted pay page. Put this in invoices and messages.
- livemode*: boolean
- image*: string nullable — Storage key of the image, reusable in image when creating another number.
- image_url*: string(uri) nullable — Where the image is served from.
- created_at*: string(date-time)
- entries*: array<object{id, object, control_number, source, payment, amount, currency, method, provider_reference, paid_at, status, receipt_number, recorded_by, verified_by, verified_at, rejected_at, reject_reason, reversed_at, reverse_reason, note, created_at}>

### Transfer

- id*: string
- object*: `transfer`
- direction*: `outgoing` \| `incoming`
- amount*: integer [-9007199254740991..9007199254740991]
- currency*: `TZS`
- note*: string nullable
- status*: `completed` \| `in_review` \| `rejected` \| `reversed`
- from*: object{handle, name, organization, verified}
- from.handle*: string nullable
- from.name*: string
- from.organization*: string
- from.verified*: boolean
- to*: object{handle, name, organization, verified}
- to.handle*: string nullable
- to.name*: string
- to.organization*: string
- to.verified*: boolean
- livemode*: boolean
- created_at*: string(date-time)
- completed_at*: string(date-time) nullable

### TransferList

- object*: `list`
- data*: array<object{id, object, direction, amount, currency, note, status, from, to, livemode, created_at, completed_at}>
- has_more*: boolean
- next_cursor*: string nullable

### Refund

- id*: string
- object*: `refund`
- payment*: string
- amount*: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- currency*: `TZS`
- status*: `pending` \| `processing` \| `succeeded` \| `failed` \| `rejected`
- reason*: string nullable
- failure_reason*: string nullable
- metadata*: object
- created_at*: string(date-time)
- completed_at*: string(date-time) nullable

### RefundList

- object*: `list`
- data*: array<object{id, object, payment, amount, currency, status, reason, failure_reason, metadata, created_at, completed_at}>
- has_more*: boolean
- next_cursor*: string nullable

### Balance

- object*: `balance`
- livemode*: boolean
- available*: array<object{amount, currency}>
- pending*: array<object{amount, currency}>

### TransactionList

- object*: `list`
- data*: array<object{id, object, type, direction, bucket, amount, balance_after, currency, source, description, created_at}>
- has_more*: boolean
- next_cursor*: string nullable

### Customer

- id*: string
- object*: `customer`
- phone*: string
- name*: string nullable
- email*: string nullable
- total_paid: integer [-9007199254740991..9007199254740991] — Amount in minor units. TZS has no minor units, so 10000 is TZS 10,000.
- payment_count: integer [-9007199254740991..9007199254740991]
- first_seen_at: string(date-time)
- last_seen_at: string(date-time)

### CustomerList

- object*: `list`
- data*: array<object{id, object, phone, name, email, total_paid, payment_count, first_seen_at, last_seen_at}>
- has_more*: boolean
- next_cursor*: string nullable

### WebhookEndpoint

- id*: string
- object*: `webhook_endpoint`
- livemode*: boolean
- url*: string
- description*: string nullable
- events*: array<string>
- status*: `ENABLED` \| `DISABLED`
- failure_streak*: integer [-9007199254740991..9007199254740991]
- disabled_reason*: string nullable
- disabled_at*: string nullable
- created_at*: string
- updated_at*: string

### WebhookEndpointCreated

- id*: string
- object*: `webhook_endpoint`
- livemode*: boolean
- url*: string
- description*: string nullable
- events*: array<string>
- status*: `ENABLED` \| `DISABLED`
- failure_streak*: integer [-9007199254740991..9007199254740991]
- disabled_reason*: string nullable
- disabled_at*: string nullable
- created_at*: string
- updated_at*: string
- secret*: string

### WebhookEndpointList

- object*: `list`
- data*: array<object{id, object, livemode, url, description, events, status, failure_streak, disabled_reason, disabled_at, created_at, updated_at}>
- has_more*: boolean
- next_cursor*: string nullable

### Event

- id*: string
- object*: `event`
- type*: `payment.pending` \| `payment.processing` \| `payment.requires_action` \| `payment.succeeded` \| `payment.failed` \| `payment.expired` \| `payment.cancelled` \| `refund.pending` \| `refund.succeeded` \| `refund.failed` \| `payout.processing` \| `payout.paid` \| `payout.failed` \| `transfer.sent` \| `transfer.received` \| `transfer.in_review` \| `transfer.rejected` \| `transfer.reversed` \| `control_number.partially_paid` \| `control_number.paid` \| `control_number.expired` \| `control_number.cancelled`
- api_version*: string
- livemode*: boolean
- created*: integer [-9007199254740991..9007199254740991]
- created_at*: string
- data*: object{object}
- data.object*: object
- deliveries: array<object{id, object, endpoint_id, event_id, attempt, status, is_replay, response_status, response_body, latency_ms, error, scheduled_at, delivered_at, next_retry_at}>

### EventList

- object*: `list`
- data*: array<object{id, object, type, api_version, livemode, created, created_at, data, deliveries}>
- has_more*: boolean
- next_cursor*: string nullable

### EventWithDeliveries

- id*: string
- object*: `event`
- type*: `payment.pending` \| `payment.processing` \| `payment.requires_action` \| `payment.succeeded` \| `payment.failed` \| `payment.expired` \| `payment.cancelled` \| `refund.pending` \| `refund.succeeded` \| `refund.failed` \| `payout.processing` \| `payout.paid` \| `payout.failed` \| `transfer.sent` \| `transfer.received` \| `transfer.in_review` \| `transfer.rejected` \| `transfer.reversed` \| `control_number.partially_paid` \| `control_number.paid` \| `control_number.expired` \| `control_number.cancelled`
- api_version*: string
- livemode*: boolean
- created*: integer [-9007199254740991..9007199254740991]
- created_at*: string
- data*: object{object}
- data.object*: object
- deliveries*: array<object{id, object, endpoint_id, event_id, attempt, status, is_replay, response_status, response_body, latency_ms, error, scheduled_at, delivered_at, next_retry_at}>
