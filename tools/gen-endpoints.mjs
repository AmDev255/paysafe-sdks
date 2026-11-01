// Generates contract/endpoints.md and contract/openapi.json from the PaySafe generated spec.
// Usage: node tools/gen-endpoints.mjs [path-to-openapi.generated.json]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const specPath = process.argv[2] ?? resolve(root, "../paysafe/docs/api/openapi.generated.json")
const spec = JSON.parse(readFileSync(specPath, "utf8"))
mkdirSync(resolve(root, "contract"), { recursive: true })
writeFileSync(resolve(root, "contract/openapi.json"), JSON.stringify(spec, null, 2) + "\n")
writeFileSync(resolve(root, "contract/VERSION"), spec.info.version + "\n")

const scopes = {
  createPayment: "payments:write", listPayments: "payments:read", getPayment: "payments:read", cancelPayment: "payments:write",
  createPaymentLink: "payments:write", listPaymentLinks: "payments:read", getPaymentLink: "payments:read", updatePaymentLink: "payments:write",
  createControlNumber: "payments:write", listControlNumbers: "payments:read", getControlNumber: "payments:read", cancelControlNumber: "payments:write",
  createRefund: "refunds:write", listRefunds: "refunds:read", getRefund: "refunds:read",
  getBalance: "balance:read", listTransactions: "balance:read",
  listCustomers: "customers:read", getCustomer: "customers:read",
  createTransfer: "transfers:write", listTransfers: "transfers:read", getTransfer: "transfers:read",
  listWebhookEndpoints: "webhooks:read", createWebhookEndpoint: "webhooks:write", getWebhookEndpoint: "webhooks:read", updateWebhookEndpoint: "webhooks:write", deleteWebhookEndpoint: "webhooks:write",
  listEvents: "events:read", getEvent: "events:read",
}

const refName = (s) => (s?.$ref ? s.$ref.split("/").pop() : null)
function typeOf(s) {
  if (!s) return "any"
  if (s.$ref) return refName(s)
  if (s.enum) return s.enum.map((e) => `\`${e}\``).join(" \\| ")
  if (s.type === "array") return `array<${typeOf(s.items)}>`
  if (s.anyOf || s.oneOf) return (s.anyOf || s.oneOf).map(typeOf).join(" \\| ")
  if (s.type === "object" && s.properties) return "object{" + Object.keys(s.properties).join(", ") + "}"
  let t = s.type ?? "any"
  if (s.format) t += `(${s.format})`
  if (s.minimum != null || s.maximum != null) t += ` [${s.minimum ?? ""}..${s.maximum ?? ""}]`
  if (s.minLength != null || s.maxLength != null) t += ` len ${s.minLength ?? 0}..${s.maxLength ?? ""}`
  if (s.nullable) t += " nullable"
  return t
}
function fields(schema, prefix = "") {
  if (!schema) return []
  if (schema.$ref) return fields(spec.components.schemas[refName(schema)], prefix)
  const out = []
  const req = new Set(schema.required ?? [])
  for (const [k, v] of Object.entries(schema.properties ?? {})) {
    out.push(`${prefix}${k}${req.has(k) ? "*" : ""}: ${typeOf(v)}${v.description ? " — " + v.description.replace(/\n/g, " ") : ""}`)
    if (v.type === "object" && v.properties) out.push(...fields(v, prefix + k + "."))
  }
  return out
}

let md = `# Endpoint inventory\n\nGenerated from \`contract/openapi.json\` (API version ${spec.info.version}) by \`tools/gen-endpoints.mjs\`. Do not edit by hand.\n\n`
md += `Base URL \`${spec.servers[0].url}\`. Auth: \`Authorization: Bearer <secret key>\` on every operation. \`*\` marks a required field. Every operation can also return 400 validation_error, 401 authentication_error, 403 permission_error/feature_disabled, 404 not_found, 409 conflict family, 429 rate_limited, 503 (see errors.md).\n\n`
md += `## Summary\n\n| # | operationId | Method | Path | Scope | Success | Idempotency-Key | Paginated |\n|---|---|---|---|---|---|---|---|\n`
const ops = []
for (const [p, methods] of Object.entries(spec.paths)) for (const [m, o] of Object.entries(methods)) if (o?.operationId) ops.push({ p, m: m.toUpperCase(), o })
ops.forEach(({ p, m, o }, i) => {
  const ok = Object.keys(o.responses).find((c) => c.startsWith("2"))
  const ik = (o.parameters ?? []).find((x) => x.in === "header" && x.name === "Idempotency-Key")
  const paged = (o.parameters ?? []).some((x) => x.in === "query" && x.name === "cursor")
  md += `| ${i + 1} | ${o.operationId} | ${m} | \`${p}\` | ${scopes[o.operationId] ?? "?"} | ${ok} | ${ik ? (ik.required ? "required" : "optional") : "no"} | ${paged ? "yes" : "no"} |\n`
})
md += `\n## Operations\n`
for (const { p, m, o } of ops) {
  md += `\n### ${o.operationId}\n\n\`${m} ${p}\` — ${o.summary ?? ""}${o.description ? "\n\n" + o.description : ""}\n\nScope: \`${scopes[o.operationId] ?? "?"}\`. Tag: ${(o.tags ?? []).join(", ")}.\n`
  const params = o.parameters ?? []
  for (const where of ["path", "query", "header"]) {
    const ps = params.filter((x) => x.in === where)
    if (!ps.length) continue
    md += `\nParameters (${where}):\n`
    for (const x of ps) md += `- \`${x.name}\`${x.required ? "*" : ""}: ${typeOf(x.schema)}${x.description ? " — " + x.description.replace(/\n/g, " ") : ""}\n`
  }
  const body = o.requestBody?.content?.["application/json"]?.schema
  if (body) {
    md += `\nRequest body (application/json)${o.requestBody.required ? ", required" : ""}${refName(body) ? ", schema " + refName(body) : ""}:\n`
    for (const f of fields(body)) md += `- ${f}\n`
  }
  md += `\nResponses:\n`
  for (const [code, r] of Object.entries(o.responses)) {
    const sch = r.content?.["application/json"]?.schema
    md += `- ${code}: ${r.description ?? ""}${sch ? " → " + (refName(sch) ?? typeOf(sch)) : ""}\n`
  }
}
md += `\n## Schemas\n`
for (const [name, s] of Object.entries(spec.components.schemas)) {
  md += `\n### ${name}\n\n`
  for (const f of fields(s)) md += `- ${f}\n`
}
writeFileSync(resolve(root, "contract/endpoints.md"), md)
console.log(`endpoints.md: ${ops.length} operations, ${Object.keys(spec.components.schemas).length} schemas, version ${spec.info.version}`)
