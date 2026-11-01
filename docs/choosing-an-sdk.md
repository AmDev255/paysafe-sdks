# Choosing an SDK

Every official SDK covers the same 29 operations with the same behaviour, so pick by your stack:

| You run | Use | Notes |
|---|---|---|
| Laravel, Symfony, plain PHP | [paysafe-php](https://github.com/AmDev255/paysafe-php) | PSR-18; Guzzle by default. |
| Express, Fastify, NestJS, scripts | [paysafe-node](https://github.com/AmDev255/paysafe-node) | TypeScript types shipped; ESM and CommonJS. |
| Next.js (App or Pages Router) | [paysafe-nextjs](https://github.com/AmDev255/paysafe-nextjs) on top of paysafe-node | Webhook route handlers, cached server client, payment-status route. |
| Django, FastAPI, Flask, scripts | [paysafe-python](https://github.com/AmDev255/paysafe-python) | Sync and asyncio clients. |
| Go services | [paysafe-go](https://github.com/AmDev255/paysafe-go) | Standard library only. |
| Spring Boot, plain Java | [paysafe-java](https://github.com/AmDev255/paysafe-java) | Records, JDK 17 HTTP client. |
| Ktor, Android backends, Kotlin services | [paysafe-kotlin](https://github.com/AmDev255/paysafe-kotlin) | Coroutines and blocking twins. |
| ASP.NET Core, .NET workers | [paysafe-dotnet](https://github.com/AmDev255/paysafe-dotnet) | Async `HttpClient`, records. |
| Rails, Sinatra | [paysafe-ruby](https://github.com/AmDev255/paysafe-ruby) | `Net::HTTP`, no runtime gems. |
| Dart servers (Shelf, Dart Frog) | [paysafe-dart](https://github.com/AmDev255/paysafe-dart) | Server-side only; never ship a secret key in a Flutter app. |

Mobile and browser apps never hold a secret key: they talk to your own server, which uses one of the SDKs above.

Each repository has the same layout: `README.md` with a quickstart, `examples/` with twelve runnable programs plus framework webhook handlers, `tests/fixtures/` shared with every other SDK, and a CI workflow that runs the full gate on every push.
