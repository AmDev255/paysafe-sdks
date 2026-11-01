# PaySafe {{LANG_TITLE}} SDK

Official {{LANG_TITLE}} library for the [PaySafe](https://paysafe.co.tz) payments API. Accept mobile-money payments in Tanzania, issue refunds, control numbers and payment links, move money between projects, and receive signed webhooks.

Part of the [PaySafe SDK directory](https://github.com/{{OWNER}}/paysafe-sdks). API reference: https://paysafe.co.tz/docs.

## Features

- Every served PaySafe API operation (29 operations, 10 resources) with typed request and response models
- Sandbox and production selected automatically from the key prefix
- Safe retries that honour `Retry-After`, idempotency keys that survive retries, cursor pagination helpers
- Polling helpers that wait for a payment, refund or transfer to reach a terminal state
- Webhook signature verification with secret rotation support and constant-time comparison
- One structured exception per documented error code, every error carries the request id
- Configurable timeouts, base URL, logger and HTTP client

## Installation

```{{INSTALL_LANG}}
{{INSTALL}}
```

## Requirements

{{REQUIREMENTS}}

## Authentication

Create a secret key in the dashboard under API keys. Test keys start with `paysafe_test_`, live keys with `paysafe_live_`. Keep keys on the server; never ship them in browsers or mobile apps. The SDK reads `PAYSAFE_SECRET_KEY` when no key is passed.

## Sandbox setup

Use a `paysafe_test_` key. The sandbox is the same API with a simulated provider; the last four digits of the customer phone choose the outcome (`0000` succeeds, `1111` is declined, `4444` expires, see the [Sandbox guide](https://paysafe.co.tz/docs/sandbox)).

## Production setup

Switch to a `paysafe_live_` key once your organisation is verified. Register a live webhook endpoint and add your server's address to the project's IP allowlist. Nothing else changes.

## Quickstart

```{{CODE_LANG}}
{{QUICKSTART}}
```

## Supported API resources

| Resource | Operations |
|---|---|
| Payments | create, list, get, cancel, waitForTerminal |
| Payment links | create, list, get, update |
| Control numbers | create, list, get, cancel |
| Refunds | create, list, get, waitForTerminal |
| Balance | get, transactions |
| Customers | list, get |
| Transfers | create, list, get, waitForTerminal |
| Webhook endpoints | list, create, get, update, delete |
| Events | list, get |
| Webhooks | verifySignature, constructEvent |

Planned by PaySafe and not yet served (not included): `ping`, payouts (`createPayout`, `getPayout`), `rotateWebhookEndpointSecret`.

## Usage examples

Runnable programs live in [`examples/`](examples/): authentication, creating and polling a payment, listing with pagination, refunds, payment links, control numbers, transfers, webhook endpoints, events and webhook verification, plus framework handlers under `examples/webhooks/`.

{{USAGE}}

## Error handling

{{ERRORS}}

## Webhook integration

{{WEBHOOKS}}

## Testing

{{TESTING}}

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
