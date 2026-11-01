// Pre-push secret and attribution scan for one or more directories. Exit 1 on any finding.
// Usage: node tools/scan-secrets.mjs <dir> [<dir> ...]
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const SKIP = new Set(["node_modules", "vendor", "dist", "build", "target", ".gradle", ".gradle-home", ".m2", ".kotlin", "bin", "obj", ".dart_tool", ".pub-cache", ".nuget", ".venv", "__pycache__", ".git", "coverage", ".idea", ".next", ".pytest_cache", ".mypy_cache", ".ruff_cache"])
const PLACEHOLDER_KEY = "paysafe_test_9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk"
const rules = [
  { name: "live key", re: /paysafe_live_[A-Za-z0-9]{20,}/g, allow: (m) => m === "paysafe_live_9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk" },
  { name: "test key (not the documented placeholder)", re: /paysafe_test_[A-Za-z0-9]{20,}/g, allow: (m) => m === PLACEHOLDER_KEY || m.startsWith("paysafe_test_9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk") },
  { name: "github token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { name: "private key block", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "aws key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "slack/stripe style secret", re: /\b(xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{16,})\b/g },
  { name: "AI attribution", re: /Co-Authored-By:|Generated with \[Claude|Claude Code|Anthropic/gi },
  { name: "VPS or password hint", re: /2\.24\.138\.235|Denic2021/g },
]

const findings = []
function walk(base, prefix = "") {
  for (const name of readdirSync(join(base, prefix))) {
    const rel = prefix ? `${prefix}/${name}` : name
    if (SKIP.has(name)) continue
    const full = join(base, rel)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(base, rel)
      continue
    }
    if (st.size > 2_000_000) continue
    if (name === "scan-secrets.mjs" || name === "check-repo.mjs" || name === "push-repo.sh") continue
    const buf = readFileSync(full)
    if (buf.includes(0)) continue
    const text = buf.toString("utf8")
    for (const rule of rules) {
      for (const m of text.matchAll(rule.re)) {
        if (rule.allow?.(m[0])) continue
        const line = text.slice(0, m.index).split("\n").length
        findings.push(`${base}/${rel}:${line}: ${rule.name}`)
      }
    }
  }
}

for (const dir of process.argv.slice(2)) walk(dir)
if (findings.length) {
  for (const f of findings) console.error("FOUND  " + f)
  process.exit(1)
}
console.log(`clean: ${process.argv.slice(2).join(", ")}`)
