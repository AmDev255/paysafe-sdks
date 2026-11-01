# SDK surface (identical operations in every language, native naming)

Naming: resources and methods below are camelCase; PHP uses `$client->paymentLinks->create()`, Python `client.payment_links.create()`, Ruby `client.payment_links.create`, Go `client.PaymentLinks.Create(ctx, …)`, C# `client.PaymentLinks.CreateAsync(…)`, Java/Kotlin `client.paymentLinks().create(…)`, Dart `client.paymentLinks.create(…)`.

## Client

```
new PaySafe({ apiKey, baseUrl = "https://api.paysafe.co.tz", timeout = 30s, maxRetries = 5, apiVersion?, httpClient?, logger?, userAgentSuffix? })
client.environment  → "test" | "live"   (from key prefix paysafe_test_ / paysafe_live_; anything else → ConfigurationError)
```
`PAYSAFE_SECRET_KEY` and `PAYSAFE_BASE_URL` environment variables are honoured when the option is omitted (matches the existing examples).

## Resources and methods

| Resource | Method | operationId | Request | Returns |
|---|---|---|---|---|
| payments | create(params, opts{idempotencyKey?}) | createPayment | amount*, customer{phone*, name?, email?}*, currency?, reference?, description?, metadata?, expires_in?, channel? | Payment (202) |
| payments | list(params?) | listPayments | limit, cursor, status, reference, customer_phone, created_gte, created_lte | Page<Payment> |
| payments | get(id) | getPayment | | Payment |
| payments | cancel(id, params?, opts{idempotencyKey?}) | cancelPayment | reason? | Payment |
| payments | waitForTerminal(id, opts) | (helper) | | Payment |
| paymentLinks | create(params) | createPaymentLink | title*, description, amount, min_amount, max_amount, currency, collect_name, collect_email, max_payments, expires_at, success_message, redirect_url, logo, accent_color | PaymentLink (201) |
| paymentLinks | list(params?) | listPaymentLinks | limit, cursor, status | Page<PaymentLink> |
| paymentLinks | get(id) | getPaymentLink | | PaymentLink |
| paymentLinks | update(id, params) | updatePaymentLink | title, description, max_payments, expires_at, status, success_message, redirect_url, collect_name, collect_email, logo, accent_color | PaymentLink |
| controlNumbers | create(params) | createControlNumber | payer_name*, title*, amount*, payer_phone, payer_email, payer_reference, description, reference, payment_type, mode, currency, expires_at, notes, instalments[], metadata, image | ControlNumber (201) |
| controlNumbers | list(params?) | listControlNumbers | limit, cursor, status, state, batch, customer, q | Page<ControlNumber> |
| controlNumbers | get(id) | getControlNumber | | ControlNumberWithEntries |
| controlNumbers | cancel(id, params) | cancelControlNumber | reason* | ControlNumber |
| refunds | create(params, opts{idempotencyKey?}) | createRefund | payment*, amount?, reason?, metadata? | Refund (202) |
| refunds | list(params?) | listRefunds | limit, cursor, payment, status | Page<Refund> |
| refunds | get(id) | getRefund | | Refund |
| refunds | waitForTerminal(id, opts) | (helper) | | Refund |
| balance | get() | getBalance | | Balance |
| balance | transactions(params?) | listTransactions | limit, cursor | Page<Transaction> |
| customers | list(params?) | listCustomers | limit, cursor, search | Page<Customer> |
| customers | get(id) | getCustomer | | Customer |
| transfers | create(params, opts{idempotencyKey?}) | createTransfer | to*, amount*, currency?, note? | Transfer (201) |
| transfers | list(params?) | listTransfers | limit, cursor | Page<Transfer> |
| transfers | get(id) | getTransfer | | Transfer |
| transfers | waitForTerminal(id, opts) | (helper) | | Transfer |
| webhookEndpoints | list() | listWebhookEndpoints | | List<WebhookEndpoint> (not paginated) |
| webhookEndpoints | create(params) | createWebhookEndpoint | url*, description?, events? | WebhookEndpointCreated (201, includes secret once) |
| webhookEndpoints | get(id) | getWebhookEndpoint | | WebhookEndpoint |
| webhookEndpoints | update(id, params) | updateWebhookEndpoint | url, description, events, status(ENABLED/DISABLED) | WebhookEndpoint |
| webhookEndpoints | delete(id) | deleteWebhookEndpoint | | void (204) |
| events | list(params?) | listEvents | limit, cursor, type, from, to, resourceId | Page<Event> |
| events | get(id) | getEvent | | EventWithDeliveries |
| webhooks | verifySignature / constructEvent / sign | (local) | see webhooks.md | boolean / Event / string |

Every call accepts per-request options: `idempotencyKey`, `requestId`, `timeout`, `maxRetries`, `headers`. Every returned object carries `requestId`, `rateLimit`, `idempotentReplayed`, `statusCode` (as a wrapper/`lastResponse` property depending on language idiom).

## Page<T>

Fields `data: T[]`, `hasMore: boolean`, `nextCursor: string|null`, `object: "list"`. Helper `autoPaging()` / `each` iterates across pages by re-issuing the list call with `cursor = nextCursor` (async iterator where native). Limit validated 1–100.

## Models

One typed model per schema (23): Error, Payment, PaymentList, PaymentLink, PaymentLinkList, ControlNumber, ControlNumberList, ControlNumberEntry, ControlNumberWithEntries, Transfer, TransferList, Refund, RefundList, Balance, TransactionList (+ Transaction item), Customer, CustomerList, WebhookEndpoint, WebhookEndpointCreated, WebhookEndpointList, Event, EventList, EventWithDeliveries. Unknown fields are preserved (forward compatible); unknown enum values do not throw (stored as raw string).

## Validation before sending

Required fields present; amounts integers within the spec bounds; phone `^\+255\d{9}$` for `customer.phone` (createPayment only; control numbers accept local format per spec); `limit` 1–100; `Idempotency-Key` 1–255; `X-Request-ID` 8–64 `[A-Za-z0-9._-]`. Validation failures raise `ValidationError`-like local error (`InvalidRequestError`, status 0) before any network call.
