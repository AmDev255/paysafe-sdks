# Error model (every SDK)

Wire format (every non-2xx response):

```json
{ "error": { "code": "validation_error", "message": "…", "request_id": "req_…", "param": "customer.phone", "details": { }, "doc_url": "https://paysafe.co.tz/docs/errors#validation_error" } }
```

## Exception hierarchy

```
PaySafeError (base; message)
├── ApiError                 any HTTP error response. Fields: status, code, message, requestId, param, details, docUrl, headers, retryAfter (seconds|null), rateLimit
│   ├── ValidationError          400 validation_error
│   ├── AuthenticationError      401 authentication_error
│   ├── PermissionError          403 permission_error   (details.code may be ip_not_allowed | ip_allowlist_empty, details.ip, details.scope)
│   ├── FeatureDisabledError     403 feature_disabled
│   ├── NotFoundError            404 not_found
│   ├── InsufficientFundsError   402 insufficient_funds (details.available, details.requested, details.currency)
│   ├── ConflictError            409 conflict
│   ├── IdempotencyConflictError 409 idempotency_conflict
│   ├── IdempotencyInProgressError 409 idempotency_in_progress
│   ├── InvalidStateError        409 invalid_state (details.status | details.reason)
│   ├── RateLimitError           429 rate_limited (details.scope)
│   ├── ProviderError            502 provider_error
│   ├── ProviderUnavailableError 503 provider_unavailable
│   ├── ServiceUnavailableError  503 service_unavailable
│   └── InternalError            500 internal / any other 5xx
├── ApiConnectionError       DNS, TLS, socket errors; no response received
├── ApiTimeoutError          request exceeded timeout (subclass of ApiConnectionError where the language allows)
├── SignatureVerificationError webhook signature missing, malformed, expired or mismatched (never thrown by verify*() boolean form; thrown by constructEvent)
└── ConfigurationError       bad api key format, bad base URL, invalid options
```

Rules:
- Map by `error.code` first; unknown code → map by status (400 ValidationError, 401, 403 PermissionError, 404, 409 ConflictError, 429, 5xx InternalError/ServiceUnavailable). Unknown codes must not crash parsing.
- A non-JSON error body (proxy/HTML) becomes `ApiError` with code `unknown`, message = status text, body preserved in `details.raw` (truncated to 4 KB).
- `requestId` is read from the body, falling back to the `X-Request-ID` header.
- `retryAfter` is parsed from `Retry-After` (integer seconds; HTTP-date also accepted → seconds from now).
- `rateLimit` = `{ limit, remaining, reset }` from `X-RateLimit-*` when present.
- `isRetryable` is true for 409 idempotency_in_progress, 429, 503, and 5xx other than those explicitly non-retryable (none today); false for every other 4xx.
- Error messages never include the API key. `toString()` prints `code (status) message [request_id]`.
- Language mapping: PHP `PaySafe\Exception\*` implementing a common interface; Python classes in `paysafe.errors`; TS/JS classes exported from the package root; Java/Kotlin unchecked exceptions `PaySafeException` tree; Go `*paysafe.Error` with `Code`, `Status`, `RequestID` and `errors.As` helpers (`paysafe.IsNotFound(err)` etc.); Ruby `PaySafe::Errors::*`; C# `PaySafeException` tree; Dart `PaySafeException` tree.
