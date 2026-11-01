// Pushes files to a GitHub repository with the Git Data API (no local git needed). One commit, authored by the token's user.
// Usage:
//   node tools/gh-push.mjs <owner/repo> <branch> <dir> --message "..." [--files a,b,c] [--replace] [--dry-run]
//   --files  only these repo-relative paths (default: every file under <dir>, honouring .gitignore-style SKIP rules)
//   --replace  the pushed tree is the whole repository (files absent locally are deleted)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative } from "node:path"
import { gh, author } from "./gh.mjs"

const [target, branch, dir, ...rest] = process.argv.slice(2)
if (!target || !branch || !dir) throw new Error("usage: gh-push.mjs <owner/repo> <branch> <dir> --message ...")
const opt = (name) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : undefined)
const message = opt("--message") || "Update"
const only = opt("--files")?.split(",").map((s) => s.trim()).filter(Boolean)
const replace = rest.includes("--replace")
const dryRun = rest.includes("--dry-run")
const SKIP = new Set(["node_modules", "vendor", "dist", "build", "target", ".gradle", ".gradle-home", ".m2", ".kotlin", "bin", "obj", ".dart_tool", ".pub-cache", ".nuget", ".venv", "__pycache__", ".git", "coverage", ".idea", ".next", ".pytest_cache", ".mypy_cache", ".ruff_cache", ".phpunit.cache", ".vs"])
const SKIP_FILES = new Set([".env", "Gemfile.lock", "pubspec.lock", "composer.lock", "package-lock.json.bak"])
const keepLock = new Set(["package-lock.json"])

function ignored(path) {
  const parts = path.split("/")
  if (parts.some((p) => SKIP.has(p))) return true
  const name = parts[parts.length - 1]
  if (SKIP_FILES.has(name)) return true
  if (name.endsWith(".gem") || name.endsWith(".nupkg") || name.endsWith(".log") || name.endsWith(".iml")) return true
  if (name === "next-env.d.ts" && !keepLock.has(name)) return true
  return false
}

function walk(base, prefix = "") {
  const out = []
  for (const name of readdirSync(join(base, prefix))) {
    const rel = prefix ? `${prefix}/${name}` : name
    if (ignored(rel)) continue
    const st = statSync(join(base, rel))
    if (st.isDirectory()) out.push(...walk(base, rel))
    else out.push(rel)
  }
  return out
}

const files = only ?? walk(dir)
for (const f of files) if (!existsSync(join(dir, f))) throw new Error(`missing ${f}`)
console.log(`${target}@${branch}: ${files.length} files${replace ? " (replace)" : ""}${dryRun ? " [dry run]" : ""}`)
if (dryRun) {
  for (const f of files) console.log("  " + f)
  process.exit(0)
}

const who = await author()
const ref = await gh("GET", `/repos/${target}/git/ref/heads/${branch}`, undefined, { allow: [404, 409] })
let parent = ref?.object?.sha ?? null
let baseTree = null
if (parent) baseTree = (await gh("GET", `/repos/${target}/git/commits/${parent}`)).tree.sha

if (!parent) {
  // Empty repository: the Git Data API needs one commit first; create it through the contents API.
  const first = files.includes("README.md") ? "README.md" : files[0]
  const created = await gh("PUT", `/repos/${target}/contents/${first}`, {
    message,
    content: readFileSync(join(dir, first)).toString("base64"),
    branch,
    committer: { name: who.name, email: who.email },
    author: { name: who.name, email: who.email },
  })
  parent = created.commit.sha
  baseTree = (await gh("GET", `/repos/${target}/git/commits/${parent}`)).tree.sha
}

const tree = []
let n = 0
for (const f of files) {
  const content = readFileSync(join(dir, f))
  const text = content.toString("utf8")
  const isText = !content.includes(0) && Buffer.from(text, "utf8").equals(content)
  let sha
  if (isText) {
    sha = (await gh("POST", `/repos/${target}/git/blobs`, { content: text, encoding: "utf-8" })).sha
  } else {
    sha = (await gh("POST", `/repos/${target}/git/blobs`, { content: content.toString("base64"), encoding: "base64" })).sha
  }
  const mode = f.endsWith(".sh") || f === "gradlew" || f === "mvnw" ? "100755" : "100644"
  tree.push({ path: f.replace(/\\/g, "/"), mode, type: "blob", sha })
  if (++n % 25 === 0) console.log(`  ${n}/${files.length} blobs`)
}
const newTree = await gh("POST", `/repos/${target}/git/trees`, replace ? { tree } : { base_tree: baseTree, tree })
const commit = await gh("POST", `/repos/${target}/git/commits`, {
  message,
  tree: newTree.sha,
  parents: parent ? [parent] : [],
  author: { name: who.name, email: who.email, date: new Date().toISOString() },
  committer: { name: who.name, email: who.email, date: new Date().toISOString() },
})
await gh("PATCH", `/repos/${target}/git/refs/heads/${branch}`, { sha: commit.sha, force: false })
console.log(`pushed ${commit.sha.slice(0, 10)} to ${target}@${branch} as ${who.name}`)
