# Engineering's test lanes

> engineering/C6, planned in #625 and realized by its DO in `suites.mjs`, `comprehensive.mjs` and `lanes.test.mjs`. It applies the Owner's test-placement decision to Engineering's source lanes, and to how a lane selects suites (#625, comment 6510333640, which supersedes the earlier reading that a package's source `npm test` runs every publisher suite; the same decision on Guard's #631). It started from Core's release PLAN, core/C28 (#622, core/A36). Consumer verification of the packed artifact, and its conformance, are not part of this Change. They are engineering/C7 (#641). The Owner approved the PLAN with one implementation safeguard, recorded under engineering/F3.

## Where a test lives, as the Owner set it

Placement follows what is being verified, not where it is convenient to invoke.

- **Engineering Tests** live under `engineering/` and run there, through `npm run test:engineering`. They verify what Engineering realizes: its drivers, its harnesses, and its acceptance of packed or installed candidates, Guard's publisher suites under `engineering/guard/` among them.
- **Embedded Tests** live in the package and run through its own test entrypoint, `npm test` in its directory. The package owns them, its scripts and their implementations.
- **External Tests** are defined for one consumer context each, under a placement and execution contract declared for that context. None is defined in this Change.

A package's `npm test` need not import, copy or relocate Engineering Tests. Its installed `npm test` still verifies the shipped package at Guard's bar, which is engineering/C7's concern.

## What this Change does

- **engineering/F1. The comprehensive lane orchestrates both owners.** It runs Engineering's own suites under `engineering/`, and each package's `npm test --if-present -w <name>` in the package's own directory, as the Workspaces lane, the evidence lane and Testing's coverage runner already do. It copies, relocates and redefines no case of either. This Change pins that with a test, so a later edit cannot quietly substitute another script or drop either side.
- **engineering/F2. Explicit suite selection.** A lane that needs a single package suite names it in the lane itself, as `npm run test:<name> -w <name>`, through one helper in `engineering/lanes/`. The helper refuses a suite the package does not declare and names it. It never falls back to another script. No lane selects a suite today, so the helper is used first by whichever later lane needs it.
- **engineering/F3. Combined evidence.** The comprehensive lane's result lists each suite it ran with its owner, Engineering or the package, and its location, and keeps each one's outcome as that suite reported it. A failure on either side fails the lane, and neither side's result stands for the other's.
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

The numbers follow engineering/T1–T4, which engineering/C5 (#610) plans. T9 is not used.

## Not in this Change

- **Consumer verification and its conformance (engineering/C7, #641).**
- **External Tests.** Each needs its own consumer-specific placement and execution contract, declared separately.
- Any package's scripts, suites or `files`.
- Any workflow job, ruleset or required check.

Approving this PLAN authorizes the engineering/C6 DO only. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
