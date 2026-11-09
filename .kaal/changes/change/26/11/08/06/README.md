# Graph becomes an optional peer of Change (kaal-graph)

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change after #1251.

## Request

The Owner's EEE dependency rule: an embedded package takes only Foundation and
Hosting as hard dependencies, and enrichment goes through an optional peer
(Packaging C20). Change declared `kaal-graph` as a production dependency. Packaging
confirmed the shape: package name `kaal-graph`, `peerDependencies` plus
`peerDependenciesMeta` optional, one exact pinned version, a dynamic guarded import,
no static top-level import. This Change owns that correction (CPO direction). It is
not part of any Hosting promotion.

## Change

- `package.json`: `kaal-graph` moves from `dependencies` to `peerDependencies`
  (`0.0.1`) with `peerDependenciesMeta` optional, and is added to `devDependencies`
  (`0.0.1`) so this package's own tests keep running. `package-lock.json` follows.
- `lib/isolation.mjs` is unchanged: it never imported Graph; it takes the caller's view.
  `lib/delivery.mjs` already imported Graph dynamically with a `cannot-assess` fallback.
- `test/verify.mjs`: Graph is probed apart from the required providers. Absent, the
  result is `cannot verify` and the cause names `kaal-graph` as the missing optional
  peer to install. No Case is skipped and no verdict is given.
- `skills/kaal-change/scripts/example-model.mjs`: the static Graph import becomes a
  guarded dynamic import; absent, the example says so and exits 3 with no assessment.
- Tests: T55 now covers Foundation and Hosting; new gating Case `change/T59` covers
  the optional peer shape; T57 now shows Hosting named and Graph not required by the
  Release gate; `package-only.mjs` requests the Graph tarball beside Change.
- Docs (README, operations, testing, SKILL) and the plan text now say `kaal-graph`,
  not `@kaihacksai/kaal-graph`; `test/plan/release.test.mjs` uses the same name.
- `test/verify.json` regenerated.

## Decision for the CPO

Without Graph the verifier reports `cannot verify`, not a distinct "not assessed"
state. The Release gate's vocabulary (verified, failed, cannot verify) lives in
`engineering/release/release.mjs`, which Engineering owns; a new state would be an
Engineering Change. Say if you want it.

## Verification

`npm test` verified; `test:publisher` 8 pass; `test:collector` 94 pass; manifest
current; root `test:engineering` 278 pass. A copy of the package with only Foundation
and Hosting resolvable: `verify.mjs` exits 2 `cannot verify` naming `kaal-graph`;
the example exits 3. T56 (packed probe, run by hand over packed artifacts): verified, 10 Cases. Not run locally: Acceptance,
which needs the lane; CI covers it.

## Boundary

No promotion, publication or version bump. Not part of the Hosting promotion.

## Review follow-up

Codex (P2, valid): the T56 probe's Graph override and its direct tarball install had
different specs, and npm rejects that (`EOVERRIDE`). The probe now declares Graph as a
direct dependency of the consumer and the override refers to it (`$kaal-graph`). Rerun
by hand over freshly packed artifacts: verified, 10 Cases.
