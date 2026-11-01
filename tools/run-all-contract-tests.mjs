// Runs every SDK's full gate (lint, offline contract suite, live sandbox suite when PAYSAFE_SECRET_KEY is set)
// and writes reports/contract-<date>.md plus one log per repo under reports/logs/.
// Usage: node tools/run-all-contract-tests.mjs [repo ...]
import { spawnSync } from "node:child_process"
import { mkdirSync, writeFileSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sdks = resolve(root, "sdks")
const key = process.env.PAYSAFE_SECRET_KEY || ""
const date = new Date().toISOString().slice(0, 10)
const vol = (repo) => `${sdks.replace(/\\/g, "/")}/${repo}:/app`
const keyEnv = key ? ["-e", `PAYSAFE_SECRET_KEY=${key}`] : []
const docker = (repo, image, cmd, extra = []) => ({ cmd: "docker", args: ["run", "--rm", ...keyEnv, ...extra, "-v", vol(repo), "-w", "/app", image, "sh", "-c", cmd] })
const shell = (repo, cmd) => ({ cmd: process.platform === "win32" ? "cmd" : "sh", args: process.platform === "win32" ? ["/c", cmd] : ["-c", cmd], cwd: resolve(sdks, repo) })

const plan = {
  "paysafe-php": docker("paysafe-php", "php:8.1-cli", "php vendor/bin/php-cs-fixer fix --dry-run && php vendor/bin/phpstan analyse --no-progress && php vendor/bin/phpunit"),
  "paysafe-node": shell("paysafe-node", "npm run check"),
  "paysafe-nextjs": shell("paysafe-nextjs", "npm run check"),
  "paysafe-python": docker("paysafe-python", "python:3.9-slim", "/app/.venv/bin/ruff check . && /app/.venv/bin/mypy && /app/.venv/bin/pytest -q"),
  "paysafe-go": shell("paysafe-go", "go vet ./... && go test ./... && go run honnef.co/go/tools/cmd/staticcheck@latest ./..."),
  "paysafe-java": docker("paysafe-java", "maven:3.9-eclipse-temurin-17", "mvn -B -q verify", ["-v", `${sdks.replace(/\\/g, "/")}/paysafe-java/.m2:/root/.m2`]),
  "paysafe-kotlin": docker("paysafe-kotlin", "gradle:8-jdk17", "gradle --no-daemon -q ktlintCheck test build", ["-v", `${sdks.replace(/\\/g, "/")}/paysafe-kotlin/.gradle-home:/root/.gradle`]),
  "paysafe-dotnet": docker("paysafe-dotnet", "mcr.microsoft.com/dotnet/sdk:8.0", "dotnet format --verify-no-changes && dotnet build -warnaserror && dotnet test --no-build && dotnet pack src/PaySafe/PaySafe.csproj -c Release -o dist", ["-v", `${sdks.replace(/\\/g, "/")}/paysafe-dotnet/.nuget:/root/.nuget`]),
  "paysafe-ruby": docker("paysafe-ruby", "ruby:3.1", "bundle install --quiet && bundle exec rubocop && bundle exec rspec && gem build paysafe-tz.gemspec && rm -f *.gem", ["-e", "BUNDLE_PATH=/app/vendor/bundle"]),
  "paysafe-dart": docker("paysafe-dart", "dart:stable", "dart pub get && dart format --output=none --set-exit-if-changed . && dart analyze --fatal-infos && dart test && dart pub publish --dry-run", ["-e", "PUB_CACHE=/app/.pub-cache"]),
}

const summaryPatterns = [/Tests: \d+.*/, /Test Files.*|Tests\s+\d+ passed.*/, /\d+ passed.*in [\d.]+s/, /^ok\s+github.*/m, /Tests run: \d+.*/, /BUILD SUCCESSFUL.*/, /Passed!.*/, /\d+ examples, \d+ failures.*/, /\+\d+( ~\d+)?: All tests passed!/, /Package has \d+ warnings?\./]

const selected = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(plan)
mkdirSync(resolve(root, "reports", "logs"), { recursive: true })
const rows = []
const env = { ...process.env, PATH: `${process.env.PATH};C:\\Program Files\\Go\\bin`, MSYS_NO_PATHCONV: "1" }
for (const repo of selected) {
  const step = plan[repo]
  if (!step) { console.error(`unknown repo ${repo}`); process.exit(2) }
  const started = Date.now()
  process.stdout.write(`${repo} ... `)
  const r = spawnSync(step.cmd, step.args, { cwd: step.cwd || root, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, shell: false })
  const out = `${r.stdout || ""}\n${r.stderr || ""}`.replace(new RegExp(key || "\u0000", "g"), "paysafe_test_***")
  writeFileSync(resolve(root, "reports", "logs", `${repo}.log`), out)
  const seconds = Math.round((Date.now() - started) / 1000)
  const ok = r.status === 0
  const summary = summaryPatterns.map((p) => out.match(p)?.[0]).filter(Boolean).map((s) => s.trim().slice(0, 90)).join(" · ") || (ok ? "ok" : `exit ${r.status}`)
  rows.push({ repo, ok, seconds, summary })
  console.log(`${ok ? "PASS" : "FAIL"} (${seconds}s) ${summary}`)
}
const lines = [
  `# Cross-language contract run ${date}`,
  "",
  `Fixtures: contract/fixtures (OpenAPI ${JSON.parse(await import("node:fs").then((m) => m.readFileSync(resolve(root, "contract", "fixtures", "index.json"), "utf8"))).version}). Live suites ${key ? "ran against the sandbox with a paysafe_test_ key" : "were skipped (no PAYSAFE_SECRET_KEY)"}.`,
  "",
  "| SDK | Result | Time | Summary |",
  "|---|---|---|---|",
  ...rows.map((r) => `| ${r.repo} | ${r.ok ? "PASS" : "FAIL"} | ${r.seconds}s | ${r.summary.replace(/\|/g, "\\|")} |`),
  "",
  `Logs: reports/logs/<repo>.log. ${rows.filter((r) => r.ok).length}/${rows.length} green.`,
]
writeFileSync(resolve(root, "reports", `contract-${date}.md`), lines.join("\n") + "\n")
console.log(`report: reports/contract-${date}.md`)
process.exit(rows.every((r) => r.ok) ? 0 : 1)
