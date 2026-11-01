# Package names (S4, checked 2026-11-01)

Scheme chosen by the user: `paysafe-tz`. Nothing is published; these names are reserved only by being written into the manifests. Re-check availability right before any future publication.

| Language | Repo (github.com/AmDev255/…) | Registry | Package name | Availability on 2026-11-01 | Notes |
|---|---|---|---|---|---|
| Node.js (JS + TS) | paysafe-node | npm | `paysafe-tz` | free (`paysafe` is taken) | Written in TypeScript, ships ESM + CJS + d.ts; one package for JavaScript and TypeScript users (decision 2026-11-01, replaces the separate TypeScript repo) |
| Next.js | paysafe-nextjs | npm | `paysafe-tz-nextjs` | free (404, checked 2026-11-01) | App Router integration on top of `paysafe-tz`: webhook route handler, server client helper, example app |
| Python | paysafe-python | PyPI | `paysafe-tz` (import `paysafe_tz`) | free (`paysafe` is taken) | |
| PHP | paysafe-php | Packagist | `paysafe-tz/paysafe-php` | free (vendor `paysafe` also free but avoided for consistency) | Namespace `PaySafe\` |
| Java | paysafe-java | Maven Central | `tz.co.paysafe:paysafe-java` | group free | Central requires proving ownership of paysafe.co.tz (DNS TXT) before publishing |
| Kotlin | paysafe-kotlin | Maven Central | `tz.co.paysafe:paysafe-kotlin` | group free | Same ownership proof |
| Go | paysafe-go | Go modules | `github.com/AmDev255/paysafe-go` | n/a | Module path changes if the repo is transferred to an org; v0 so no `/v2` suffix |
| Ruby | paysafe-ruby | RubyGems | `paysafe-tz` (`require "paysafe"` module `PaySafe`) | free (`paysafe` is taken) | |
| C# | paysafe-dotnet | NuGet | `PaySafe.Tz` | free (`PaySafe` is taken) | Namespace `PaySafe` |
| Dart | paysafe-dart | pub.dev | `paysafe_tz` | free (`paysafe` also free) | |

npm organisation `paysafe-tz` could not be checked anonymously (403); unscoped names are used so no org is needed.
