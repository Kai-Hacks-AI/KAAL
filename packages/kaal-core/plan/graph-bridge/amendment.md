# core/C55 PLAN: bounded amendment of one Core test value (the Graph path bridge)

Review material only. This PLAN changes no test, script or package byte; it asks for approval of one bounded change to an existing, immutable test.

## Why

Kai chose a path bridge for Graph's rename to `@kaihacksai/kaal-graph`, because a stacked merge cannot work under the squash, batch-1, all-green queue. Step 1 changes Core's devDependency to `"kaal-graph": "file:../kaal-graph"`, which resolves to the same workspace link. Core's boundary test asserts the devDependency value `"0.0.1"`, so it must follow. Step 3 (core/C54, #1242) later flips the key to the scoped name with `"0.0.1"` and removes the bridge.

## The amendment

`packages/kaal-core/test/boundary.test.ts` line 92, one value: `assert.equal(pkg.devDependencies["kaal-graph"], "0.0.1")` becomes `assert.equal(pkg.devDependencies["kaal-graph"], "file:../kaal-graph")`. No title, assertion shape or other line changes. `amendment.patch` is the exact change, written against `kaal/graph`.

## Evidence

Local proof on `kaal/graph`: with this value, the script edit below and a regenerated manifest, Core's suite passes 172/172, `dist/node/provenance.json` is byte-identical to the baseline, and `test/verify.json` moves only in `package.json`'s digest. Renaming Graph's workspace on top leaves all of that unchanged.

## Interaction with core/C54

core/C54's `amendment.patch` changes this same line to the scoped key. After step 1 lands, that line reads `"file:../kaal-graph"`, so core/C54's patch is re-based on it when its DO is written; its approved bounds (the key's package name) do not change.

## Bounds

One value of one existing test. The DO that follows also edits `packages/kaal-core/package.json` (the devDependency spec), `scripts/deliver-node.mjs` line 24 (skip the version equality for a `file:` spec; a script, not a test) and the regenerated `test/verify.json`, plus the lock through Engineering's route. No promotion or publication.
