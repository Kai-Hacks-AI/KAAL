# Foundation: register the package with Guard (PLAN, foundation/C22)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Intent: foundation/I15 (the collector), with Guard's discovery rule (guard/F43 to F45, landed on `kaal/guard/registration`).

## Change, From, To, Because
- **Change:** Foundation carries one `kaal-guard.json` at its package root, naming the checks that guard it.
- **From:** `packages/kaal-foundation/` has no `kaal-guard.json`. Guard's diff-based selection finds no check for a changed Foundation file, so Foundation is protected only by what CI runs for all.
- **To:** `packages/kaal-foundation/kaal-guard.json` is `{ "checks": [ ... ] }` in the shape of guard/F43. Two checks: `build` (the package build) and `collector` (`04-test/engineering-check/collect.mjs`, then the installed verification `dist/test/package-check/verify.mjs`). Guard runs each from the repository root, so every `run` names its program and a repository-relative file as words, with no shell feature and no `npx`.
- **Because:** the Owner's discovery rule (one file per package root) makes Guard select by the nearest file. Without it Foundation is invisible to Guard and cannot be one of the five rulesets' selected packages.

## Requirement (provisional ids)
- **foundation/F45** [foundation/I15]: The package root holds `kaal-guard.json`. It parses as JSON with a `checks` list; each check has a unique `id` without spaces or colons and a `run` that names a file inside `packages/kaal-foundation/` that exists; no `run` uses `npx`, `npm exec` or a shell feature; the file lists no member other than `id`, `run`, `when`.
- **foundation/N25** [foundation/I15]: The file is not in `dist/` and not in `files`: it is delivery tooling and ships nowhere.

## Planned Case
`guard-registration.red.mjs` (this folder; a `.red.mjs` file is not collected and must not reach `main`). Run from the package root: `node --test 00-changes/guard-registration/guard-registration.red.mjs`. RED today: the file is missing. The DO adds `kaal-guard.json`, moves the Case beside its Node as `02-requirements/functional/guard-registration.test.mjs` with its `tests` front matter, and Engineering's ARTIST registers it in `cases.json`.

## Open for the DO
Whether Guard's `run` may chain build then collector (two checks run in listed order, or one script). The DO decides against Guard's runner; this PLAN fixes only what the file must satisfy.

## Not authorized
No SYNC, promotion, version bump, ledger entry, release dispatch or npm publication.
