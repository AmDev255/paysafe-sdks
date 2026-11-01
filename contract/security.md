# Security requirements (every SDK)

User instruction 2026-11-01: SDKs must defend against hostile or malformed input they receive, from the integrator's code and from the network. Each item below is a test case in every repo (`tests/Unit/SecurityTest`).

## Input the integrator passes in

| Input | Rule | Failure |
|---|---|---|
| Resource ids in URL paths (`id`, `payment`) | Must match `^[A-Za-z0-9_-]{1,64}$`. Always percent-encoded when placed in a path. Never accept `/`, `?`, `#`, `%`, whitespace or control characters. | `InvalidRequestException` before any request |
| Query parameters | Percent-encoded (RFC 3986). `cursor` ≤ 200 printable ASCII chars. `limit` integer 1–100. Date filters must be RFC 3339 strings or `DateTimeInterface`. | `InvalidRequestException` |
| `Idempotency-Key` | 1–255 printable ASCII (0x20–0x7E), no CR/LF. | `InvalidRequestException` |
| `X-Request-ID` | `^[A-Za-z0-9._-]{8,64}$`. | `InvalidRequestException` |
| Custom headers | Names `^[A-Za-z0-9-]+$`; values must not contain CR, LF or NUL. `Authorization`, `Host`, `Content-Length` cannot be overridden. | `InvalidRequestException` |
| Amounts | Integer type only (no floats, no numeric strings), within the spec bounds for the operation. | `InvalidRequestException` |
| Phone (`customer.phone`) | `^\+255\d{9}$` for createPayment. | `InvalidRequestException` |
| Enums (`channel`, `reason`, `mode`, `status`, `currency`) | Only documented values. | `InvalidRequestException` |
| `metadata` | Must be a JSON object (string keys). Encoded size ≤ 8 KB. | `InvalidRequestException` |
| Any request body | Encoded size ≤ 64 KB (API limit). Strings must be valid UTF-8. | `InvalidRequestException` |
| `url` for webhook endpoints, `redirect_url` | Must parse as an absolute `https://` URL (http allowed only for localhost). | `InvalidRequestException` |
| API key | Must start with `paysafe_test_` or `paysafe_live_`; no whitespace. Never appears in exception messages, logs, `toString()` or serialised objects. | `ConfigurationException` |
| `baseUrl` | Absolute URL. `https://` required unless host is `localhost`, `127.0.0.1`, `[::1]` or `host.docker.internal`, or the integrator passes `allowInsecureHttp = true`. No credentials, query or fragment in the URL. | `ConfigurationException` |

## Transport

- TLS certificate verification always on; no option to disable it.
- Redirects are never followed (a redirect would resend the bearer token to another host). A 3xx response is surfaced as `ApiException` with code `unexpected_redirect`.
- Only the configured base URL is contacted. Paths are built from fixed templates plus encoded parameters; never from user strings.
- Response bodies are read with a cap (16 MB) and decoded with `assoc`/dictionary mode, never into live objects (no PHP `unserialize`, no Python `pickle`, no Java polymorphic typing, no Ruby `Marshal`/`YAML.load`).
- Error bodies that are not JSON are truncated to 4 KB before being attached to the exception.
- Logger records never contain the key, the `Authorization` header, request bodies or response bodies.
- `User-Agent` is fixed by the SDK plus an optional integrator suffix validated like a header value.

## Webhooks

- Verification uses the raw request bytes; the SDK never re-serialises JSON before signing.
- Signature comparison is constant-time (`hash_equals`, `hmac.compare_digest`, `crypto.timingSafeEqual`, `MessageDigest.isEqual`, `subtle.ConstantTimeCompare`, `CryptographicOperations.FixedTimeEquals`, `Rack::Utils.secure_compare`, Dart manual constant-time loop).
- Timestamp tolerance enforced in both directions (default 300 s).
- Header length capped at 4 KB and payload at 1 MB before any hashing, to bound CPU on garbage input.
- `constructEvent` rejects payloads that are not a JSON object with string `id` and `type`.
- Exceptions never include the secret or the expected signature.
- Framework examples: read the raw body, verify first, respond `400` on failure, deduplicate on event id, never log the payload before verification.

## Supply chain and repo hygiene

- Minimal dependencies (standard library HTTP where practical; one well-known HTTP client otherwise), pinned by caret ranges, lockfiles committed where the ecosystem expects them for libraries (none for PHP/Ruby/Python libraries; `package-lock.json` for Node repos).
- Dependency review / security scanning in CI; `gitleaks` before every push.
- No secrets, `.env` files or real keys in the repo; the only test key string is the documented placeholder `paysafe_test_9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk`.
