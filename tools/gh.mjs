// Minimal GitHub REST helper. The token comes from GITHUB_TOKEN or the file named by GITHUB_TOKEN_FILE; it is never logged.
import { readFileSync } from "node:fs"

const token = (process.env.GITHUB_TOKEN || (process.env.GITHUB_TOKEN_FILE ? readFileSync(process.env.GITHUB_TOKEN_FILE, "utf8") : "")).trim()
if (!token) throw new Error("Set GITHUB_TOKEN or GITHUB_TOKEN_FILE")

export async function gh(method, path, body, { raw = false, allow = [] } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "paysafe-sdks-tools",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const text = await res.text()
  if (!res.ok && !allow.includes(res.status)) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  if (raw) return res.ok ? text : null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function author() {
  const user = await gh("GET", "/user")
  const emails = await gh("GET", "/user/emails", undefined, { allow: [403, 404] })
  const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified)?.email : null
  return { name: user.name || user.login, email: primary || `${user.id}+${user.login}@users.noreply.github.com`, login: user.login }
}
