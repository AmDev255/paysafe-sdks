// Copies contract/fixtures/* into every sdks/*/tests/fixtures/. Usage: node tools/sync-fixtures.mjs [repo]
import { readdirSync, copyFileSync, mkdirSync, existsSync } from "node:fs"
import { dirname, resolve, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const src = resolve(root, "contract/fixtures")
const only = process.argv[2]
const repos = (only ? [only] : readdirSync(resolve(root, "sdks"))).filter((r) => existsSync(resolve(root, "sdks", r)))
for (const r of repos) {
  const dst = resolve(root, "sdks", r, "tests/fixtures")
  mkdirSync(dst, { recursive: true })
  for (const f of readdirSync(src)) copyFileSync(join(src, f), join(dst, f))
  console.log(`${r}: ${readdirSync(src).length} fixtures synced`)
}
