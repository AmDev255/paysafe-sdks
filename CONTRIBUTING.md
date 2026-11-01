# Contributing

Each SDK lives in its own repository (see the table in the README); open issues and pull requests there for language-specific changes. This repository holds what the SDKs share.

## Changing the contract

1. Update `contract/openapi.json` from the API's generated specification and bump `contract/VERSION`.
2. Regenerate and validate the fixtures: `node tools/gen-fixtures.mjs && node tools/validate-fixtures.mjs`.
3. Copy them into every SDK checkout under `sdks/`: `node tools/sync-fixtures.mjs`.
4. Run every gate: `PAYSAFE_SECRET_KEY=paysafe_test_... node tools/run-all-contract-tests.mjs` and commit the new `reports/contract-<date>.md`.
5. Update `coverage-matrix.md` and the per-language rules in `contract/*.md` when behaviour changes.

## Adding a language

`node tools/new-sdk.mjs <language>` scaffolds a repository from `template/` with the shared fixtures, CI and the README skeleton. The README markers (`<!-- TODO:… -->`) must all be filled before `node tools/check-repo.mjs <repo>` passes.

## Rules every SDK follows

Read `contract/sdk-surface.md`, `contract/errors.md`, `contract/retry.md`, `contract/polling.md`, `contract/webhooks.md` and `contract/security.md`. The contract test suite in each repository is derived from the same fixtures, so a behaviour that differs between languages is a bug in one of them.

## Commits

Plain commit messages in the imperative, no attribution trailers. Never commit keys: `node tools/scan-secrets.mjs <dir>` runs before every push.
