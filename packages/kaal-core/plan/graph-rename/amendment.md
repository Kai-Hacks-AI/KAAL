# core/C54 PLAN: bounded amendment of four Core test lines (Graph's scoped package name)

Review material only. This PLAN changes no test, script or package byte; it asks for approval of one bounded change to existing, immutable tests, beside the Core Change that follows Graph's rename of `kaal-graph` to `@kaihacksai/kaal-graph` (Kai's coordinated rename; release plan step 7).

## Why

Core's tests name Graph by its unscoped package name in four places. Once Graph publishes and links as `@kaihacksai/kaal-graph`, an import of `"kaal-graph"` no longer resolves and the devDependency assertion no longer finds its key, so Core's suite fails until these lines follow the name.

## The amendment

Each line changes the package name only, `kaal-graph` to `@kaihacksai/kaal-graph`:

- `test/core.test.ts` line 25: the import specifier.
- `test/plan/love.test.mjs` line 7: the import specifier; line 31: the allowed-package list entry for core/N11 (the check `isKaal` already accepts both spellings).
- `test/boundary.test.ts` line 92: the devDependency key.

No title, assertion shape, fixture or other line changes. `amendment.patch` is the exact change, written against `kaal/graph`. It is independent of the Foundation pin amendment (core/C53, `boundary.test.ts` line 91).

## Bounds

Four lines of three existing tests, names only. The Change that follows also edits `packages/kaal-core/package.json` (the devDependency name), `bench/admission.mjs` (its import) and the regenerated `test/verify.json` (provenance names the scoped package; `scripts/deliver-node.mjs` and core/T85 already accept both names), plus the lockfile through Engineering's route. It travels alone and lands together with Graph's own rename. No promotion or publication.
