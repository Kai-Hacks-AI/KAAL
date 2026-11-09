# Defect: Change duplicates Engineering's Release gate (known-RED Case)

Capability: Change. Integration scope: Change only.
Collector: kaal/change (established again at main 251e814). Destination: main through a separate promotion.

## Request

Kai (9 Nov 2026): the potential defect against Change's T57 and its package-only probe
is recorded as a Defect and driven out, possibly as a hotfix, so Engineering's release
thread can remove `engineering/release/release.mjs`.

## Locating the defect (Intent, Requirements, Architecture, Code)

- **Intent change/I23** (an ordinary install is enough to use the package) is Change's and holds.
- **Requirement change/F49** mixes two claims. "Declare the providers at exact versions" is
  Change's. "A fresh consumer requesting only Change obtains the providers and passes
  verification, qualified by checked tarball overrides" restates Engineering's F32 (pack once,
  install in a clean directory, judge the verification record). Registry availability is
  Engineering's F29, and F49 itself calls it "a separate gate".
- **Architecture change/A23** and F49 still describe Graph as a required production
  dependency, which #1256 changed in code and in the README, operations and testing docs. That
  is a miss of #1256, recorded here too.
- **Code and tests.** `change/T57` calls `readiness()` from `engineering/release/release.mjs`
  to test Engineering's gate. The packed-artifact probe `change/T56` (`test/publisher/package-only.mjs`)
  imports `verification` from the same file and repeats pack, override, install and judge, and
  reaches `engineering/` by a relative path, so it only runs inside the monorepo. `change/T55`
  checks Change's own manifest and stays.

## Rule broken

Tests live in one place and run against targets. A dependency on KAAL is fine for development,
not for running. Engineering owns the Release engine (engineering/F28 to F35).

## This Change

Adds `test/plan/defect-release-duplicates.test.mjs`, three known-RED Cases (it fails 3 of 3
today): no file imports `engineering/release`; no install probe or `test:package-only` script;
F49 and A23 say Graph is an optional peer. It is report-only: no gating script runs it, so Guard
sees no new failure. No product code, test or doc changes here.

## Boundary

The fixing Change turns the Cases GREEN, retires T56 and T57 and moves the Cases into gating
tests. No promotion, publication or version bump.
