# Engineering's test lanes

> PLAN (engineering/C6): nothing below exists yet. This PLAN applies the Owner's test-entry convention (#625, comments 6504401799 and 6507308611) to Engineering's source lanes, and to how a lane selects a package's suites. It started from Core's release PLAN, core/C28 (#622, core/A36). Consumer verification of the packed artifact, and its conformance, are not part of this Change. They are engineering/C7, a separate Change planned on its own (see "Not in this Change"). Approving this PLAN authorizes only the engineering/C6 DO, on `kaal/engineering`.

## The convention, as the Owner set it

- **In the source workspace,** `npm test` is the comprehensive entry. It runs the publisher suite, the consumer suite and any other declared `test:<name>` suites, and it never invokes itself.
- **In the installed package,** `npm test` runs consumer verification only, and needs neither the publisher tests nor KAAL's Engineering repository.
- **Each package owns its suites, its scripts and their implementations.** Engineering orchestrates them in the package's own directory. It never copies, relocates or redefines them. A lane may select a named suite explicitly.

## What this Change does

- **engineering/F1. Source lanes run each package's own entry.** The Workspaces lane, the evidence lane and Testing's coverage runner already run `npm test --if-present -w <name>` in the package's own directory. That stays the comprehensive entry, so they need no change of behaviour. This Change pins it with a test, so a later edit cannot quietly substitute another script.
- **engineering/F2. Explicit suite selection.** A lane that needs a single suite names it in the lane itself, as `npm run test:<name> -w <name>`, through one helper in `engineering/lanes/`. The helper refuses a suite the package does not declare and names it. It never falls back to another script. No lane selects a suite today, so the helper is used first by whichever later lane needs it.
- **engineering/N2. Nothing is rewritten.** No lane writes, copies or rewrites a package's tests or scripts.

## What other Capabilities own

- **Core.** core/C29 keeps source `npm test` comprehensive and makes installed `npm test` consumer-only. Core's C28 (core/A36) is to be revised from "today's script becomes `test:publisher`" to this convention. With that, C29 needs nothing from Engineering.
- **Testing.** Its coverage runner keeps running `npm test`, which stays comprehensive. The earlier ask for a script option was withdrawn.
- **Guard.** Its source `npm test` is consumer-only today. Making it comprehensive is Guard's own Change.
- **One script, two meanings.** npm ships the same `scripts.test` it reads in source. How a package makes `npm test` comprehensive in source and consumer-only once installed is the package's choice, within Packaging's entrypoint conventions.

## Test Cases

These go in `engineering/lanes/lanes.test.mjs` and join `npm run test:engineering`. Each runs on fixture workspaces in a scratch directory, and each is first observed RED against a deliberately wrong lane. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong lane that makes it RED |
| --- | --- | --- |
| engineering/T5 | The Workspaces lane runs a fixture package's `npm test`, in the package's own directory. Each script writes a marker that names its working directory | One that runs `test:publisher` instead, or runs from the repository root |
| engineering/T6 | Suite selection runs exactly the named `test:<name>`, and refuses an undeclared one, naming it | One that falls back to `test` |
| engineering/T7 | No lane writes, copies or rewrites a package's tests or scripts. The fixture tree is byte-identical before and after | One that writes a script into the fixture's `package.json` |

The numbers follow engineering/T1–T4, which engineering/C5 (#610) plans. T8 and T9 are no longer used here.

## Not in this Change

- **Consumer verification and its conformance (engineering/C7).** Running each packed artifact's installed `npm test`, and applying Testing's conformance cases to it, including the negative scenarios, is a separate bounded Change. Its own PLAN states its dependencies on Testing and Packaging.
- Any package's scripts, suites or `files`.
- Any workflow job, ruleset or required check.

Approving this PLAN authorizes the engineering/C6 DO only. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
