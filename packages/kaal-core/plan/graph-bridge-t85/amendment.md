# core/C56 PLAN: bounded amendment of core/T85 for the Graph path bridge

Review material only. This PLAN changes no test, script or package byte; it asks for approval of one bounded change to an existing, immutable test. It completes core/C55 (#1245), whose evidence was incomplete.

## Why

core/C55 authorised `test/boundary.test.ts` line 92 for the bridge value `"file:../kaal-graph"`. The bridge DO (#1252) then failed CI in Core's `test/run.mjs`, in the plan suite that the earlier local run did not include: core/T85 (`test/plan/standalone.test.mjs`) asserts two things the bridge breaks.

- Line 180: `devDependencies[<Graph workspace name>]` equals Graph's version. With the bridge it is `"file:../kaal-graph"`. Fails at step 1.
- Line 177: the manifest's `name` equals Graph's workspace name. `scripts/deliver-node.mjs` writes the devDependency key as `name`; once Graph's workspace is renamed (step 2) the key is still `kaal-graph` while the workspace is `@kaihacksai/kaal-graph`. Fails at step 2.

Evidence: the full suite (`npm test -w kaal-core`, every suite) at step 1 fails core/T85 alone; at step 2 it fails core/T85 alone, at line 177.

## The amendment

`packages/kaal-core/test/plan/standalone.test.mjs`, core/T85, two assertions:

- the manifest's `name` is compared with the Graph package as `devDependencies` declares it (the key matching the existing `GRAPH` pattern), not with the workspace's name;
- the pin assertion accepts the workspace's version, as before, or a `file:` spec that resolves to the Graph workspace directory.

No title, fixture, other assertion or import changes (`resolve` is already imported). `amendment.patch` is the exact change, written against `kaal/graph`.

Both assertions hold unchanged for today's tree (key and workspace both `kaal-graph`, pin `0.0.1`) and for the final tree after core/C54 (key and workspace both scoped, pin `0.0.1`). The `provenance.json` bytes are untouched in steps 1 and 2.

## Evidence

On `kaal/graph` with the bridge DO, the amended T85 and a regenerated manifest, the full suite passes at step 1 and, with Graph's workspace renamed, at step 2: 172 + 9 + 8 + 5 + 5 tests, 0 failing; `npm run manifest -w kaal-core -- --check` says current at step 2.

## Bounds

Two assertions of one existing test. The DO adds this file to the bridge change (#1252) as a sixth path, which changes its ledger entry. No promotion or publication.
