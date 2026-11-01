# PaySafe SDKs

Directory of the official SDKs for the [PaySafe](https://paysafe.co.tz) payments API, plus the shared contract they are tested against. API reference: https://paysafe.co.tz/docs.

| Language | Repository | Package | Runtime |
|---|---|---|---|
| PHP | https://github.com/AmDev255/paysafe-php | Packagist `paysafe-tz/paysafe-php` | PHP 8.1+ |
| Node.js / TypeScript | https://github.com/AmDev255/paysafe-node | npm `paysafe-tz` | Node 18+ |
| Next.js | https://github.com/AmDev255/paysafe-nextjs | npm `paysafe-tz-nextjs` | Next.js 14+ |
| Python | https://github.com/AmDev255/paysafe-python | PyPI `paysafe-tz` | Python 3.9+ |
| Go | https://github.com/AmDev255/paysafe-go | module `github.com/AmDev255/paysafe-go` | Go 1.21+ |
| Java | https://github.com/AmDev255/paysafe-java | Maven `tz.co.paysafe:paysafe-java` | JDK 17+ |
| Kotlin | https://github.com/AmDev255/paysafe-kotlin | Maven `tz.co.paysafe:paysafe-kotlin` | Kotlin 1.9+, JDK 17+ |
| .NET | https://github.com/AmDev255/paysafe-dotnet | NuGet `PaySafe.Tz` | .NET 8 |
| Ruby | https://github.com/AmDev255/paysafe-ruby | RubyGems `paysafe-tz` | Ruby 3.1+ |
| Dart | https://github.com/AmDev255/paysafe-dart | pub.dev `paysafe_tz` | Dart 3 (servers) |

Registry publication is pending; until then install each SDK from its repository as described in its README.

## What every SDK provides

- All 29 served API operations across payments, payment links, control numbers, refunds, balance, customers, transfers, webhook endpoints and events, with the same names in every language.
- Sandbox or production selected from the key prefix; retries that honour `Retry-After`; idempotency keys that survive retries; cursor pagination helpers; polling helpers for payments, refunds and transfers.
- Webhook signature verification with secret rotation support and constant-time comparison.
- One typed error per documented error code, each carrying the request id.
- Input validation before any request leaves the process: ids, headers, amounts, phone numbers, enums, metadata size and body size; https-only base URLs; redirects never followed; response size caps; the key never appears in errors or logs.

## This repository

| Path | Contents |
|---|---|
| `contract/` | The OpenAPI contract the SDKs implement, the shared fixtures (`contract/fixtures/`, one per operation plus the webhook vector and retry scenarios), and the written rules for errors, retries, polling, webhooks, security and package names. |
| `coverage-matrix.md` | Operation-by-operation coverage per SDK. |
| `reports/` | Cross-language contract runs (`contract-<date>.md`) with one log per SDK. |
| `tools/` | Fixture generator and validator, fixture sync, repo scaffolder, per-repo gate, secret scan, the all-SDK test runner and the push helpers. |
| `template/` | Files every SDK repository starts from. |
| `PLAN.md`, `STATUS.md` | The build plan and its tracker. |

To regenerate the fixtures after an API change: `node tools/gen-fixtures.mjs && node tools/validate-fixtures.mjs && node tools/sync-fixtures.mjs`, then run `node tools/run-all-contract-tests.mjs` with the SDK repositories checked out under `sdks/`.

## License

MIT, like every SDK.
