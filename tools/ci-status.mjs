// Prints the latest GitHub Actions run per SDK repository. Usage: node tools/ci-status.mjs [repo ...]
import { gh } from "./gh.mjs"

const all = ["paysafe-php", "paysafe-node", "paysafe-nextjs", "paysafe-python", "paysafe-go", "paysafe-java", "paysafe-kotlin", "paysafe-dotnet", "paysafe-ruby", "paysafe-dart"]
const repos = process.argv.slice(2).length ? process.argv.slice(2) : all
let pending = 0
for (const repo of repos) {
  const runs = await gh("GET", `/repos/AmDev255/${repo}/actions/runs?per_page=5`, undefined, { allow: [404] })
  const run = runs?.workflow_runs?.find((r) => r.name === "CI")
  if (!run) {
    console.log(`${repo.padEnd(16)} no CI run yet`)
    pending++
    continue
  }
  const state = run.status === "completed" ? run.conclusion : run.status
  if (state !== "success" && state !== "failure") pending++
  let detail = ""
  if (state === "failure") {
    const jobs = await gh("GET", `/repos/AmDev255/${repo}/actions/runs/${run.id}/jobs`)
    detail = jobs.jobs.flatMap((j) => j.steps.filter((s) => s.conclusion === "failure").map((s) => `${j.name}: ${s.name}`)).join("; ")
  }
  console.log(`${repo.padEnd(16)} ${String(state).padEnd(12)} #${run.run_number} ${run.html_url}${detail ? "\n                 failed step: " + detail : ""}`)
}
process.exit(pending ? 2 : 0)
