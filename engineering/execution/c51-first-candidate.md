# C51 adoption: first candidate evidence and dependency decision

Owner: Engineering. This evidence follows approved PLAN #785 on `kaal/ci-execution` at `7e2e4dd7d80a5383910850bb6fbab40d376739fd`. It proposes no implementation, suppression, workflow change, dependency transfer, synchronization or promotion. The Owner's integration hold remains: Branching auto-merge reaches main first, Change Isolation follows, and this work does not enter that promotion pair.

## Observed in actual CI

[Workspaces job 124847468831](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41306366379/job/124847468831), run `41306366379`, attempt 1, passed on Linux with Node `v24.22.1`, npm `11.19.1`, image `ubuntu-24.04` / `20261025.353.1`. Service metadata names PR head `f27e6f3c80e19e48c44fb755c32fb3fd9f03bb5e`; checkout logs identify the tested merge commit as `d53797455aaaebdda557cc4cf3ef17fc9c663225`. These are different identities with different meanings. #785 changes only its PLAN document, leaving the runtime source at main `be3a2d09a386967bd5a1cd4a850f389951bc0796`.

The log reports `Core's Hosting boundary` twice inside Core's source `npm test`. Both occurrences contain the same five passing labels:

| Case label, shortened here only | First duration (ms) | Second duration (ms) |
| --- | ---: | ---: |
| permitted: shipped JavaScript uses declared host modules | 23.566270 | 11.612874 |
| prohibited: an undeclared host builtin fails with its location | 8.464752 | 6.505019 |
| undecidable: undecidable host access is reported for validation | 8.057176 | 5.154865 |
| path kind comes from Hosting | 0.840951 | 0.494509 |
| runtime dependencies and Graph's build-only role | 0.276131 | 0.179212 |

The suite reports `42.460376 ms` then `24.760011 ms`. The second Node invocation reports five passed, zero failed/cancelled/skipped/todo and `duration_ms 75.497137`. The exact labels and bounded original transcript excerpt are retained in [evidence/core-boundary-785.json](evidence/core-boundary-785.json), with source references and explicit unknowns. This is derived transcript evidence, not a new test recorder or a reconstructed authoritative Case record.

Static source explains a likely path: Core's source `test/run.mjs` runs every declared `test:<name>` suite. Both `test:publisher` and `test:boundary` name `dist-test/boundary.test.js`; `tsconfig.test.json` builds it from `test/boundary.test.ts`. Their build/preamble steps differ. Linking the two log occurrences to those two scripts is a source-supported inference, not a loaded-file receipt in the log.

**Classification:** a real repeated-Case-label candidate in the current CI path. Safe duplicate identity and redundancy are not established. No verified failure of the current assurance contract is claimed. No `duplicates()` input is fabricated from this incomplete log, and no suppression is enabled.

**Measured saving: not established.** The second Node duration is an observation, not a projected job saving. It excludes build/setup costs and cannot justify removing them; no paired candidate run exists. Log timestamps are buffered output and are not per-Case execution start times. Foundation/Core overlap in the local comprehensive orchestrator remains a separate candidate; it is not added to this CI measurement.

## Core's decision is necessary

Core owns these Cases and its source runner contract. Core's accepted `core/A34`, `core/F75` and planned `core/T80` explicitly require running every declared source suite; the release architecture says `core/C29` decides whether a subset suite stays declared. Engineering's accepted no-rewrite boundary also forbids altering package tests/scripts to manufacture coverage.

Before admitting this candidate, the Core owner must decide whether the standalone boundary invocation establishes independent assurance after its build, or whether the publisher observation can satisfy both requests within an explicitly equivalent domain. The decision must identify setup/teardown, built and inspected bytes, source/package/dependency inputs, cwd, flags, environment and observation transport. Another invocation's failure or uncertainty must remain intact. A label match or unchanged checkout SHA supplies none of that by itself.

If Core keeps the independent invocation, retain it and reject this optimization candidate. If Core authorizes sharing, establish the necessary Core-owned execution contract in its own bounded Change, preserving existing Case assertions and the comprehensive source-entrypoint promise. Engineering cannot make that decision through a parser shortcut or by silently omitting `test:boundary`.

## Testing dependency route: bounded proposal for review

The target still lacks C51. At the inspected refs, Testing's entire unpromoted delta is **111 paths**, 8,541 added and 41 removed lines, including timing/redesign, model/verifiers, release documents and discovery changes. Merging or promoting all of that as a C51 prerequisite is not an isolated dependency delivery.

Preferred default: keep this collector dependency-free until separately authorized Testing readiness/promotion makes C51 available on main; then synchronize by the governed route. This does not request or open a promotion now and respects the current integration order.

If the Owner instead wants an isolated dependency delivery before Testing's full promotion, request a separate Testing-owned dependency PLAN. The concrete inventory to evaluate is:

| Surface | Proposed necessary content / adaptation |
| --- | --- |
| Implementation | C51's exact `lib/duplicates.mjs`; it imports nothing and requires neither timing/redesign nor C129. |
| Public interface and source suite | Add only `./duplicates` to the existing main package export map, and run C50's immutable `test/plan/duplicates.test.mjs` plus C51's `test/duplicates-inputs.test.mjs` once. Preserve all existing selections and dependencies. |
| Contract meaning | C50's four duplicate PLAN documents and a narrowly owned current usage/contract description. Do not transplant the collector's unrelated six-document release set or broaden established Nodes. |
| Package delivery assertion | Extend the existing exact packed-file inventory by this module; do not replace the test with the newer collector version containing unrelated expectations. |
| Packed acceptance | Preserve C51's public-interface scenario. Main discovers `test/acceptance/`, while C51 uses `test/engineer/`; its placement must be an explicit reviewed adaptation, or must wait for the separately reviewed discovery dependency. No hidden directory migration. |
| Mutation evidence | Preserve the C51 mutation runner and receipt and rerun it against the actual dependency candidate. Existing source Cases, file-path/Node discrimination and intentional execution separation remain. |

There is also a concrete target-governance conflict to resolve before such a transfer: C50's immutable `duplicates.test.mjs` imports `createHash` from `node:crypto` for T109's file digests, while main's `AGENTS.md` requires Foundation for KAAL SHA-256. An Engineering DO must neither silently edit that PLAN-established helper nor silently ignore the target rule. Testing/Owner must explicitly resolve it through the appropriate reviewed Case/helper version or other authorized disposition; the proposed transfer is not ready to execute as-is.

This table is a proposal to inventory and review, not approval to transfer even these files. In particular, C50 names C38 for the final script layout: whether a bounded transfer may defer that release layout needs Testing/Owner judgment and exact-target tests. No new package name/version, npm publication, runtime dependency, lockfile change, plan-consumer inventory dependency, complete Testing collector merge or self-certified provenance is implied. Prove the exact candidate diff and package identity if that route is selected.

## Immediate next decisions

1. Core qualification of the observed five repeated labels: independent required execution, or one approved shareable execution domain.
2. Testing/Owner decision on dependency delivery: normal promoted availability, or a separately approved narrow Testing dependency PLAN with the adaptations above.
3. Once those prerequisites are satisfied, establish the approved immutable Engineering acceptance boundary before DO. The three-host matched before/after experiment and full assurance remain activation prerequisites from #785.

The current outcome is concrete CI evidence plus two unresolved owner/dependency decisions. It is not a completed adapter, an integration authorization or a performance improvement.
