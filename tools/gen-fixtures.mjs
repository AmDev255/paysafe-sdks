// Synthesizes contract/fixtures/<operationId>.json from contract/openapi.json (the spec has no examples).
// Each fixture: request (path params, query, headers, body) + responses (success + every documented error code).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createHmac } from "node:crypto"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const spec = JSON.parse(readFileSync(resolve(root, "contract/openapi.json"), "utf8"))
const out = resolve(root, "contract/fixtures")
mkdirSync(out, { recursive: true })

const ULID = "01J7A9Q0K3M4N5P6R7S8T9V0W1"
const idPrefix = { Payment: "pay_", PaymentLink: "plk_", ControlNumber: "ctn_", ControlNumberEntry: "cte_", Transfer: "trf_", Refund: "rfd_", Customer: "cus_", WebhookEndpoint: "whe_", WebhookEndpointCreated: "whe_", Event: "evt_", EventWithDeliveries: "evt_", Transaction: "lex_", Error: "req_" }
const deref = (s) => (s?.$ref ? spec.components.schemas[s.$ref.split("/").pop()] : s)

function sample(schema, name = "", owner = "") {
  const s = deref(schema)
  if (!s) return null
  if (s.example !== undefined) return s.example
  if (s.enum) return s.enum[0]
  if (s.anyOf || s.oneOf) return sample((s.anyOf || s.oneOf)[0], name, owner)
  if (s.allOf) return Object.assign({}, ...s.allOf.map((x) => sample(x, name, owner)))
  const type = s.type ?? (s.properties || s.additionalProperties ? "object" : "string")
  switch (type) {
    case "string": {
      if (name === "id") return (idPrefix[owner] ?? "obj_") + ULID
      if (/(_id|Id)$/.test(name)) return "pay_" + ULID
      if (name === "channel") return "mpesa"
      if (name === "payment_link") return s.nullable ? null : "plk_" + ULID
      if (name === "operator") return "vodacom"
      if (name === "object") return owner.replace(/List$|WithEntries$|Created$/, "").replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()
      if (/phone/.test(name)) return "+255712340000"
      if (s.format === "email" || /email/.test(name)) return "amina@example.com"
      if (s.format === "uri" || /url/.test(name)) return "https://merchant.example/paysafe/webhook"
      if (s.format === "date-time" || /_at$|_gte$|_lte$|^created$|^from$|^to$/.test(name)) return "2026-09-07T10:00:04Z"
      if (name === "currency") return "TZS"
      if (name === "cursor" || name === "next_cursor") return "eyJpZCI6InBheV8wMUo3QTlRMEszIn0"
      if (name === "payment") return "pay_" + ULID
      if (name === "to") return "merchant_shop"
      if (name === "request_id") return "req_" + ULID
      if (name === "code") return "validation_error"
      if (name === "secret") return "paysafe_webhook_test_2f4c9b7e1a3d5f6c8e0b2a4d6f8c1e3b"
      if (name === "number") return "991234567890"
      if (name === "status") return "pending"
      if (name === "type") return "payment.succeeded"
      if (name === "reason") return "requested_by_customer"
      if (name === "api_version") return spec.info.version
      const min = s.minLength ?? 0
      let v = name ? `${name} value` : "text"
      if (v.length < min) v = v.padEnd(min, "x")
      if (s.maxLength && v.length > s.maxLength) v = v.slice(0, s.maxLength)
      return v
    }
    case "integer":
    case "number": {
      if (name === "amount" || name === "net" || name === "available" || name === "pending") return Math.max(s.minimum ?? 0, Math.min(10000, s.maximum ?? 10000))
      if (name === "fee") return 250
      if (name === "limit") return 25
      if (name === "created") return 1788775204
      if (name === "expires_in") return 300
      if (/refunded|paid|balance|count|attempt/.test(name)) return 0
      return Math.max(0, s.minimum ?? 1)
    }
    case "boolean":
      return name === "has_more" ? false : name === "livemode" ? false : true
    case "array":
      return s.items ? [sample(s.items, name.replace(/s$/, ""), owner)] : []
    case "object":
    default: {
      if (!s.properties) return s.additionalProperties ? { order_id: "8812" } : {}
      if (name === "failure" && s.nullable) return null
      const o = {}
      for (const [k, v] of Object.entries(s.properties)) {
        const ds = deref(v)
        if (k === "data" && ds?.type === "array") o[k] = [sample(ds.items, "", (deref(ds.items)?.$ref ?? v.items?.$ref ?? "").split("/").pop() || owner)]
        else o[k] = sample(v, k, v.$ref ? v.$ref.split("/").pop() : owner)
      }
      return o
    }
  }
}

function minimalBody(schema) {
  const s = deref(schema)
  const o = {}
  for (const k of s.required ?? []) o[k] = sample(s.properties[k], k)
  return o
}

const errorBody = (code, status, extra = {}) => ({
  error: { code, message: `${code} example`, request_id: "req_" + ULID, doc_url: `https://paysafe.co.tz/docs/errors#${code}`, ...extra },
})
const errorsByStatus = {
  400: ["validation_error", { param: "amount", details: { in: "body", issues: [{ path: "amount", message: "Required", code: "invalid_type" }] } }],
  401: ["authentication_error", {}],
  403: ["permission_error", { details: { scope: "payments:write" } }],
  404: ["not_found", {}],
  409: ["idempotency_conflict", {}],
  429: ["rate_limited", { details: { scope: "api:key" } }],
  503: ["service_unavailable", {}],
}

let count = 0
const index = []
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!op?.operationId) continue
    const params = op.parameters ?? []
    const pathParams = Object.fromEntries(params.filter((p) => p.in === "path").map((p) => [p.name, sample(p.schema, p.name, "Payment")]))
    const query = Object.fromEntries(params.filter((p) => p.in === "query").map((p) => [p.name, sample(p.schema, p.name)]))
    const headers = { Authorization: "Bearer paysafe_test_9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk" }
    const ik = params.find((p) => p.in === "header" && p.name === "Idempotency-Key")
    if (ik) headers["Idempotency-Key"] = "order-8812-attempt-1"
    const bodySchema = op.requestBody?.content?.["application/json"]?.schema
    const resolvedPath = path.replace(/\{(\w+)\}/g, (_, k) => pathParams[k])
    const responses = {}
    for (const [code, r] of Object.entries(op.responses)) {
      const schema = r.content?.["application/json"]?.schema
      if (code.startsWith("2")) {
        const schemaName = schema?.$ref?.split("/").pop() ?? ""
        responses[code] = { headers: { "X-Request-ID": "req_" + ULID, "X-RateLimit-Limit": "50", "X-RateLimit-Remaining": "49", "X-RateLimit-Reset": "1788775205", ...(ik ? { "Idempotent-Replayed": "false" } : {}) }, body: schema ? sample(schema, "", schemaName) : null, schema: schemaName || null }
      } else {
        const [ecode, extra] = errorsByStatus[code] ?? ["unknown", {}]
        responses[code] = { headers: { "X-Request-ID": "req_" + ULID, ...(code === "429" || code === "503" ? { "Retry-After": "2" } : {}), ...(code === "401" ? { "WWW-Authenticate": 'Bearer realm="paysafe"' } : {}) }, body: errorBody(ecode, code, extra), code: ecode }
        if (code === "409") responses["409_in_progress"] = { headers: responses[code].headers, body: errorBody("idempotency_in_progress", 409), code: "idempotency_in_progress" }
      }
    }
    const fixture = {
      operationId: op.operationId,
      method: method.toUpperCase(),
      path,
      resolvedPath,
      pathParams,
      query,
      headers,
      body: bodySchema ? sample(bodySchema) : null,
      minimalBody: bodySchema ? minimalBody(bodySchema) : null,
      bodyRequired: !!op.requestBody?.required,
      responses,
    }
    writeFileSync(resolve(out, `${op.operationId}.json`), JSON.stringify(fixture, null, 2) + "\n")
    index.push({ operationId: op.operationId, method: fixture.method, path, file: `${op.operationId}.json` })
    count++
  }
}

const body = String.raw`{"id":"evt_01J7A9R5VKM4N5P6R7S8T9V0B6","object":"event","type":"payment.succeeded","api_version":"2026-09-01","livemode":false,"created_at":"2026-09-07T10:00:04Z","data":{"object":{"id":"pay_01J7A9Q0K3M4N5P6R7S8T9V0W1","object":"payment","status":"succeeded","amount":10000,"currency":"TZS"}},"request":{"id":"req_01J7A9QX2KM4N5P6R7S8T9V0E9","idempotency_key":"order-8812-attempt-1"}}`
const secret = "paysafe_webhook_test_2f4c9b7e1a3d5f6c8e0b2a4d6f8c1e3b"
const timestamp = 1788775204
const sig = (sec) => createHmac("sha256", sec).update(`${timestamp}.${body}`).digest("hex")
const vector = {
  secret,
  timestamp,
  body,
  signature: sig(secret),
  header: `t=${timestamp},v1=${sig(secret)}`,
  legacy: { secret: "whsec_test_2f4c9b7e1a3d5f6c8e0b2a4d6f8c1e3b", signature: sig("whsec_test_2f4c9b7e1a3d5f6c8e0b2a4d6f8c1e3b"), note: "Signature printed on the docs page before the S12 fix; computed with the un-branded secret." },
  rotation: { header: `t=${timestamp},v1=${"0".repeat(64)},v1=${sig(secret)}`, note: "Second v1 is the valid one." },
  secondSecret: { secret: "paysafe_webhook_test_0000000000000000000000000000000f", signature: sig("paysafe_webhook_test_0000000000000000000000000000000f") },
  tolerance: 300,
  nowValid: timestamp + 10,
  nowExpired: timestamp + 301,
  nowFuture: timestamp - 301,
  tamperedBody: body.replace('"amount":10000', '"amount":10001'),
  headers: { "PaySafe-Event-Id": "evt_01J7A9R5VKM4N5P6R7S8T9V0B6", "PaySafe-Delivery-Id": "whd_01J7A9R5VKM4N5P6R7S8T9V0C7", "PaySafe-Attempt": "1", "Content-Type": "application/json", "User-Agent": "PaySafe-Webhooks/1.0" },
}
writeFileSync(resolve(out, "webhook-vector.json"), JSON.stringify(vector, null, 2) + "\n")

const retry = {
  defaults: { maxAttempts: 5, initialBackoffMs: 500, maxBackoffMs: 8000, multiplier: 2, jitter: "full", timeoutMs: 30000, inProgressSleepMs: 1000 },
  scenarios: [
    { name: "429 then 200 honours Retry-After", request: "getBalance", sequence: [{ status: 429, code: "rate_limited", headers: { "Retry-After": "1" } }, { status: 200 }], expect: { attempts: 2, sleptAtLeastMs: 1000, result: "success" } },
    { name: "503 then 200", request: "getBalance", sequence: [{ status: 503, code: "service_unavailable", headers: { "Retry-After": "1" } }, { status: 200 }], expect: { attempts: 2, result: "success" } },
    { name: "409 idempotency_in_progress then 202 keeps the same key", request: "createPayment", sequence: [{ status: 409, code: "idempotency_in_progress" }, { status: 202 }], expect: { attempts: 2, sameIdempotencyKey: true, result: "success" } },
    { name: "409 idempotency_conflict is not retried", request: "createPayment", sequence: [{ status: 409, code: "idempotency_conflict" }], expect: { attempts: 1, error: "IdempotencyConflictError" } },
    { name: "400 is not retried", request: "createPayment", sequence: [{ status: 400, code: "validation_error" }], expect: { attempts: 1, error: "ValidationError" } },
    { name: "network error on GET is retried", request: "getPayment", sequence: [{ networkError: true }, { status: 200 }], expect: { attempts: 2, result: "success" } },
    { name: "network error on keyed POST is retried with the same key", request: "createRefund", sequence: [{ networkError: true }, { status: 202 }], expect: { attempts: 2, sameIdempotencyKey: true, result: "success" } },
    { name: "network error on unkeyed POST is not retried", request: "createWebhookEndpoint", sequence: [{ networkError: true }], expect: { attempts: 1, error: "ApiConnectionError" } },
    { name: "500 on keyed POST retried up to max attempts", request: "createPayment", sequence: [{ status: 500 }, { status: 500 }, { status: 500 }, { status: 500 }, { status: 500 }], expect: { attempts: 5, error: "InternalError" } },
    { name: "502 provider_error on createPayment is not retried", request: "createPayment", sequence: [{ status: 502, code: "provider_error" }], expect: { attempts: 1, error: "ProviderError" } },
    { name: "timeout then success", request: "listPayments", sequence: [{ timeout: true }, { status: 200 }], expect: { attempts: 2, result: "success" } },
    { name: "Idempotent-Replayed header surfaces", request: "createPayment", sequence: [{ status: 202, headers: { "Idempotent-Replayed": "true" } }], expect: { attempts: 1, idempotentReplayed: true } },
    { name: "unknown error code maps by status", request: "getBalance", sequence: [{ status: 418, code: "teapot_error" }], expect: { attempts: 1, error: "ApiError", code: "teapot_error" } },
    { name: "non-JSON error body", request: "getBalance", sequence: [{ status: 400, rawBody: "<html>Bad request</html>" }], expect: { attempts: 1, error: "ApiError", code: "unknown" } },
    { name: "non-JSON 502 from a proxy is retried on GET", request: "getBalance", sequence: [{ status: 502, rawBody: "<html>Bad gateway</html>" }, { status: 200 }], expect: { attempts: 2, result: "success" } },
  ],
}
writeFileSync(resolve(out, "retry-scenarios.json"), JSON.stringify(retry, null, 2) + "\n")
writeFileSync(resolve(out, "index.json"), JSON.stringify({ version: spec.info.version, operations: index }, null, 2) + "\n")
console.log(`fixtures: ${count} operations, webhook vector, retry scenarios`)
