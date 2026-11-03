# Engineering's test lanes

> engineering/C6, planned in #625 and realized by its DO in `suites.mjs`, `comprehensive.mjs` and `lanes.test.mjs`. It applies the Owner's test-placement decision to Engineering's source lanes, and to how a lane selects suites (#625, comment 6510333640, which supersedes the earlier reading that a package's source `npm test` runs every publisher suite; the same decision on Guard's #631). It started from Core's release PLAN, core/C28 (#622, core/A36). Consumer verification of the packed artifact, and its conformance, are not part of this Change. They are engineering/C7 (#641). The Owner approved the PLAN with one implementation safeguard, recorded under engineering/F3. The Owner's review of the DO (5717407563) added engineering/F20 and F21, so that the root lane follows the declared root Test Plan across all three contexts.

## Where a test lives, as the Owner set it

Placement follows what is being verified, not where it is convenient to invoke.

- **Engineering Tests** live under `engineering/` and run there, through `npm run test:engineering`. They verify what Engineering realizes: its drivers, its harnesses, and its acceptance of packed or installed candidates, Guard's publisher suites under `engineering/guard/` among them.
- **Embedded Tests** live in the package and run through its own test entrypoint, `npm test` in its directory. The package owns them, its scripts and their implementations.
- **External Tests** are defined for one External context each, under a placement and execution contract declared for that context. External means a KAAL-loaded agent applying KAAL knowledge to serve another repository, not a package consumer. None is defined in this Change, and the root Test Plan says so (engineering/F21).

A package's `npm test` need not import, copy or relocate Engineering Tests. Its installed `npm test` still verifies the shipped package at Guard's bar, which is engineering/C7's concern.

## What this Change does

- **engineering/F1. The comprehensive lane orchestrates every owner.** It runs Engineering's own suites under `engineering/`, and each package's suites in the package's own directory (engineering/F20). It copies, relocates and redefines no case of either. This Change pins that with a test, so a later edit cannot quietly substitute another script or drop either side.
- **engineering/F2. Explicit suite selection.** A lane that needs a single package suite names it in the lane itself, as `npm run test:<name> -w <name>`, through one helper in `engineering/lanes/`. The helper refuses a suite the package does not declare and names it. It never falls back to another script. No lane selects a suite today, so the helper is used first by whichever later lane needs it.
- **engineering/F3. Combined evidence.** The comprehensive lane's result lists each suite it ran with its owner, Engineering or the package, and its location, and keeps each one's outcome as that suite reported it. A failure on either side fails the lane, and neither side's result stands for the other's.
- **engineering/F20. The declared root Test Plan** (the Owner's review 5717407563). Root `npm test` follows `engineering/lanes/plan.json` and each workspace's own declared scripts. It runs every applicable suite once and attributes each one to its owner and context:
  - **Engineering:** the root suites the plan names.
  - **Embedding:** each workspace's `npm test`, plus every `test:<suite>` the workspace declares that its `npm test` is not shown to run. A workspace's `npm test` may be consumer-only or comprehensive, as its own plan declares, so its publisher coverage is never inferred from the command alone. A suite counts as run by `npm test` only when `npm test` names it with `npm run`, is the same command, or runs `node --test` after the same preamble on a superset of its files. Anything else runs on its own, because a duplicate costs time and an omission would be a false GREEN.
  - **External:** the suites the plan declares, each run in its own location.
- **engineering/F21. Not applicable is not unresolved.** The plan accounts for every root `test:*` script: it is either run, or recorded as run by another suite. A script it does not account for is unresolved. External with neither suites nor a recorded reason that none applies is unresolved. The lane is `failed` when a suite failed or has no entrypoint, otherwise `unresolved` when anything is unresolved, and otherwise `passed`. Root `npm test` exits 0, 1 or 2 accordingly. Only a reason recorded in the plan makes External not applicable, and that reason is the Owner's (#610).
- **The Owner's safeguard (#625, review 5712215303).** A workspace with no `test` entrypoint is never counted as verified: neither lane runs `npm test --if-present`. The workspace is reported as having no test entrypoint, and the lane fails. Whether an absence is allowed is for the applicable package contract to say, and no contract allows one today.
- **engineering/N2. Nothing is rewritten.** No lane writes, copies or rewrites a package's tests or scripts.

## What other Capabilities own

- **Guard.** guard/C129 (#631) is being revised to the same decision: Guard's publisher suites stay Engineering Tests under `engineering/guard/`, and the package's `npm test` runs its own tests. This Change needs nothing moved into `packages/kaal-guard/`.
- **Core.** core/C29 sets what Core's own `npm test` runs. This Change runs it as it is and asks for no publisher suite to move into Core.
- **Testing.** Its coverage runner keeps running each package's `npm test`. The earlier ask for a script option was withdrawn.
- **One script, two meanings.** npm ships the same `scripts.test` it reads in source. How a package's `npm test` runs its Embedded Tests in source and its shipped tests once installed is the package's choice, within Packaging's entrypoint conventions.

## Test Cases

These go in `engineering/lanes/lanes.test.mjs` and join `npm run test:engineering`. Each runs on fixture workspaces in a scratch directory, and each is first observed RED against a deliberately wrong lane. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong lane that makes it RED |
| --- | --- | --- |
| engineering/T5 | The comprehensive lane runs a fixture package's `npm test` in the package's own directory, and a fixture Engineering suite under `engineering/`. Each script writes a marker that names its working directory | One that runs only the packages' `npm test`, or runs `test:publisher` instead, or runs from the repository root |
| engineering/T6 | Suite selection runs exactly the named `test:<name>`, and refuses an undeclared one, naming it | One that falls back to `test` |
| engineering/T7 | No lane writes, copies or rewrites a package's tests or scripts. The fixture tree is byte-identical before and after | One that writes a script into the fixture's `package.json` |
| engineering/T8 | The lane's result lists the Engineering suite and the package suite separately, each with its owner and location. A failure in either fails the lane, naming it | One that reports a single merged outcome |
| engineering/T37 | A publisher suite a workspace's `npm test` does not run is still run, once, in the workspace's directory. Suites that `npm test` runs, by `npm run` or by the same files, are not run again | One that runs only each `npm test`, one that counts every suite as covered, or one that counts none |
| engineering/T38 | A failing publisher suite outside `npm test` fails the lane | One that runs only each `npm test` |
| engineering/T39 | Declared External suites run in their location and count. With none declared and no recorded reason, the lane is unresolved, never passed | One that skips External suites, passes an unresolved lane, or treats an unrecorded External as not applicable |
| engineering/T40 | A root test script the plan does not account for is unresolved and does not run. A script the plan names but the root lacks is missing | One that ignores unaccounted root scripts |

The numbers follow engineering/T1–T4, which engineering/C5 (#610) plans. T9 is not used. T37–T40 follow the numbers other Engineering PLANs had taken when the Owner asked for them.

## Not in this Change

- **Consumer verification and its conformance (engineering/C7, #641).**
- **Any External Test.** Each needs its own placement and execution contract for its External context, declared by its owner. Until one is declared, or the Owner records that none applies, root `npm test` reports External as unresolved.
- Any package's scripts, suites or `files`.
- Any workflow job, ruleset or required check.

Approving this PLAN authorizes the engineering/C6 DO only. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
