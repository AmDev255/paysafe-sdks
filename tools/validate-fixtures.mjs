// S2 gate: every served operation has a fixture with >=1 success and >=1 error response whose bodies match the spec
// shapes (required fields present, enums respected), and the webhook vector verifies with the documented algorithm.
import { readFileSync, readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createHmac, timingSafeEqual } from "node:crypto"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const spec = JSON.parse(readFileSync(resolve(root, "contract/openapi.json"), "utf8"))
const dir = resolve(root, "contract/fixtures")
const read = (f) => JSON.parse(readFileSync(resolve(dir, f), "utf8"))
const deref = (s) => (s?.$ref ? spec.components.schemas[s.$ref.split("/").pop()] : s)
const problems = []

function check(value, schema, where) {
  const s = deref(schema)
  if (!s) return
  if (s.anyOf || s.oneOf) {
    const opts = s.anyOf || s.oneOf
    const before = problems.length
    for (const o of opts) {
      const start = problems.length
      check(value, o, where)
      if (problems.length === start) { problems.length = before; return }
    }
    return
  }
  if (value === null) { if (!s.nullable) problems.push(`${where}: null but not nullable`); return }
  if (s.enum && !s.enum.includes(value)) problems.push(`${where}: ${JSON.stringify(value)} not in enum`)
  if (s.type === "object" && s.properties) {
    if (typeof value !== "object" || Array.isArray(value)) return problems.push(`${where}: expected object`)
    for (const r of s.required ?? []) if (!(r in value)) problems.push(`${where}.${r}: required field missing`)
    for (const [k, v] of Object.entries(value)) if (s.properties[k]) check(v, s.properties[k], `${where}.${k}`)
  } else if (s.type === "array") {
    if (!Array.isArray(value)) return problems.push(`${where}: expected array`)
    value.forEach((v, i) => check(v, s.items, `${where}[${i}]`))
  } else if (s.type === "integer") {
    if (!Number.isInteger(value)) problems.push(`${where}: expected integer`)
    else { if (s.minimum != null && value < s.minimum) problems.push(`${where}: ${value} < min ${s.minimum}`); if (s.maximum != null && value > s.maximum) problems.push(`${where}: ${value} > max ${s.maximum}`) }
  } else if (s.type === "string") {
    if (typeof value !== "string") problems.push(`${where}: expected string`)
    else { if (s.minLength != null && value.length < s.minLength) problems.push(`${where}: shorter than ${s.minLength}`); if (s.maxLength != null && value.length > s.maxLength) problems.push(`${where}: longer than ${s.maxLength}`) }
  } else if (s.type === "boolean" && typeof value !== "boolean") problems.push(`${where}: expected boolean`)
}

let ops = 0
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!op?.operationId) continue
    ops++
    let f
    try { f = read(`${op.operationId}.json`) } catch { problems.push(`${op.operationId}: fixture missing`); continue }
    if (f.method !== method.toUpperCase() || f.path !== path) problems.push(`${op.operationId}: method/path mismatch`)
    const codes = Object.keys(f.responses)
    if (!codes.some((c) => c.startsWith("2"))) problems.push(`${op.operationId}: no success response`)
    if (!codes.some((c) => /^[45]/.test(c))) problems.push(`${op.operationId}: no error response`)
    const bodySchema = op.requestBody?.content?.["application/json"]?.schema
    if (bodySchema) { check(f.body, bodySchema, `${op.operationId}.body`); check(f.minimalBody, bodySchema, `${op.operationId}.minimalBody`) }
    for (const [code, r] of Object.entries(op.responses)) {
      const fx = f.responses[code]
      if (!fx) { problems.push(`${op.operationId}: response ${code} missing`); continue }
      const schema = r.content?.["application/json"]?.schema
      if (schema) check(fx.body, schema, `${op.operationId}.responses.${code}`)
      if (!code.startsWith("2") && fx.body?.error?.request_id === undefined) problems.push(`${op.operationId}.responses.${code}: error envelope without request_id`)
    }
    for (const p of op.parameters ?? []) if (p.in === "path" && !(p.name in f.pathParams)) problems.push(`${op.operationId}: path param ${p.name} missing`)
  }
}

const v = read("webhook-vector.json")
const hmac = (sec, t, body) => createHmac("sha256", sec).update(`${t}.${body}`).digest("hex")
const eq = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
if (!eq(hmac(v.secret, v.timestamp, v.body), v.signature)) problems.push("webhook vector: signature does not verify")
if (eq(hmac(v.secret, v.timestamp, v.tamperedBody), v.signature)) problems.push("webhook vector: tampered body verifies")
if (!eq(hmac(v.legacy.secret, v.timestamp, v.body), v.legacy.signature)) problems.push("webhook vector: legacy signature mismatch")
if (v.legacy.signature !== "880ac7fb8a4bb2ddbd615706ebabde6dbd040552d546b830c5a696e7b23b3d08") problems.push("webhook vector: legacy signature should equal the one printed in the docs")
const v1s = v.rotation.header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3))
if (!v1s.some((s) => eq(s, hmac(v.secret, v.timestamp, v.body)))) problems.push("webhook vector: rotation header has no valid v1")

const r = read("retry-scenarios.json")
if (!Array.isArray(r.scenarios) || r.scenarios.length < 10) problems.push("retry scenarios: fewer than 10")
const known = new Set(Object.values(spec.paths).flatMap((m) => Object.values(m).map((o) => o?.operationId)).filter(Boolean))
for (const s of r.scenarios) if (!known.has(s.request)) problems.push(`retry scenario "${s.name}": unknown operation ${s.request}`)

const files = readdirSync(dir).filter((f) => f.endsWith(".json")).length
console.log(`operations ${ops}, fixture files ${files}, problems ${problems.length}`)
for (const p of problems) console.log(" - " + p)
process.exit(problems.length ? 1 : 0)
