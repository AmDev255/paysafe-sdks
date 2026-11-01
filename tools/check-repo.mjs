// Pre-push gate for one SDK repo: required files, no template TODO markers, fixtures in sync with contract/,
// no secrets, no AI attribution text. Usage: node tools/check-repo.mjs <repo-folder-name>
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { dirname, resolve, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repo = process.argv[2]
if (!repo) { console.error("usage: node tools/check-repo.mjs <repo-folder-name>"); process.exit(2) }
const dir = resolve(root, "sdks", repo)
const problems = []

const required = ["README.md", "CHANGELOG.md", "CONTRIBUTING.md", "SECURITY.md", "LICENSE", ".gitignore", ".editorconfig", ".github/workflows/ci.yml", ".github/workflows/release.yml", "tests/fixtures/index.json", "examples"]
for (const f of required) if (!existsSync(join(dir, f))) problems.push(`missing ${f}`)

const SKIP = new Set(["node_modules", "vendor", "dist", "build", "target", ".gradle", ".gradle-home", ".m2", ".kotlin", "bin", "obj", ".dart_tool", ".pub-cache", ".nuget", ".venv", "__pycache__", ".git", "coverage", ".idea", ".next"])
const files = []
function walk(d) {
  for (const name of readdirSync(d)) {
    if (SKIP.has(name)) continue
    const p = join(d, name)
    if (statSync(p).isDirectory()) walk(p)
    else files.push(p)
  }
}
walk(dir)

const secretPatterns = [
  [/paysafe_live_(?!9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk\b)[A-Za-z0-9]{8,}/, "live PaySafe key"],
  [/paysafe_test_(?!9f2Kx7Qm3Rt8Vw2Yz5Ab1Cd4Ef6Gh9Jk\b|\.\.\.|…|<|x{3,}|\{)[A-Za-z0-9]{16,}/, "test PaySafe key that is not the documented placeholder"],
  [/ghp_[A-Za-z0-9]{30,}/, "GitHub token"],
  [/github_pat_[A-Za-z0-9_]{30,}/, "GitHub fine-grained token"],
  [/AKIA[0-9A-Z]{16}/, "AWS key"],
  [/-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/, "private key"],
  [/sk_live_[A-Za-z0-9]{16,}/, "Stripe-style live key"],
  [/paysafe_webhook_live_[A-Za-z0-9]{8,}/, "live webhook secret"],
]
const attribution = [/co-authored-by:\s*claude/i, /generated (by|with) (claude|anthropic|ai)/i, /anthropic/i, /claude code/i, /\bChatGPT\b/i]
const README_TODO = /<!--\s*TODO:\w+\s*-->/

for (const p of files) {
  const rel = relative(dir, p)
  if (/\.(png|jpg|jpeg|gif|ico|jar|gem|nupkg|tgz|zip|lock)$/i.test(rel)) continue
  let text
  try { text = readFileSync(p, "utf8") } catch { continue }
  for (const [re, label] of secretPatterns) if (re.test(text)) problems.push(`${rel}: contains ${label}`)
  for (const re of attribution) if (re.test(text)) problems.push(`${rel}: contains AI attribution text (${re})`)
  if (README_TODO.test(text)) problems.push(`${rel}: template TODO marker left`)
  if (/\{\{[A-Z_]+\}\}/.test(text) && !/webhookSecret|key\.test|url\.api/.test(text)) problems.push(`${rel}: unreplaced template placeholder`)
  if (/\.env(\.|$)/.test(rel) && !/\.env\.example$/.test(rel)) problems.push(`${rel}: env file must not be committed`)
}

const contractFx = resolve(root, "contract/fixtures")
if (existsSync(join(dir, "tests/fixtures"))) {
  for (const f of readdirSync(contractFx)) {
    const a = readFileSync(join(contractFx, f), "utf8")
    const bPath = join(dir, "tests/fixtures", f)
    if (!existsSync(bPath)) problems.push(`tests/fixtures/${f} missing (run tools/sync-fixtures.mjs)`)
    else if (readFileSync(bPath, "utf8") !== a) problems.push(`tests/fixtures/${f} differs from contract (run tools/sync-fixtures.mjs)`)
  }
}

const readme = existsSync(join(dir, "README.md")) ? readFileSync(join(dir, "README.md"), "utf8") : ""
for (const h of ["## Features", "## Installation", "## Requirements", "## Authentication", "## Sandbox setup", "## Production setup", "## Quickstart", "## Supported API resources", "## Usage examples", "## Error handling", "## Webhook integration", "## Testing", "## Contributing", "## License"]) if (!readme.includes(h)) problems.push(`README missing section ${h}`)

console.log(`${repo}: ${files.length} files scanned, ${problems.length} problems`)
for (const p of problems) console.log(" - " + p)
process.exit(problems.length ? 1 : 0)
