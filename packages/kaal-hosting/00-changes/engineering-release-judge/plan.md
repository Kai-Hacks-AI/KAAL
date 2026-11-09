# PLAN: Hosting's tests stop re-judging Engineering's Release judge (hosting/D21)

This is the PLAN. It authorizes the Case corrections below and changes no Case, test file or allocation. The DO that removes the judge calls follows once this PLAN is accepted.

## Why

hosting/D21 (recorded, with hosting/T270 RED and hosting/T271 passing): Hosting's publisher tests import `engineering/release/release.mjs` and call its `readiness()` and `verification()`. Engineering judges release readiness and acceptance once, in its Package control, for every package that leaves main; the Owner's rules are that tests live in one place and run against their targets, and that a dependency on KAAL is fine for development but not for running.

## The rule this PLAN follows

The Owner's ruling (Kai, 2026-11-09): Case immutability exists to stop code from silently changing things. A decided Defect or Change may change or retire Cases openly; that is a different discussion from silent drift. Hosting's AGENTS.md ("Planned Cases are immutable once their RED has merged") therefore does not bar this correction, provided the correction is explicit, traced to the Defect, and authorized by an accepted PLAN before the DO. This PLAN is that authorization. No frozen originals and no successor identities are created merely to satisfy immutability.

## Where it sits

In the order Intent, Requirements, Architecture, Code: hosting/I5, hosting/I6, hosting/F15, hosting/F21, hosting/F22 and hosting/A25 stay as they are. hosting/F15 (exact runtime versions) and hosting/F21 and hosting/F22 (the result and evidence record) are Hosting's contract and keep Cases. Only the Code level changes: the Cases below.

## What the DO may do

Case identities are kept, because the Hosting contract each one asserts remains.

| Case | Today | Correction authorized |
| --- | --- | --- |
| hosting/T83 [hosting/F15] | exact runtime versions, and Engineering's `readiness()` over the real package and registry facts | **Retired.** Its exact-version clause is already asserted by hosting/T174. Its readiness clause belongs to Engineering's Package control. |
| hosting/T174 [hosting/F15] (supersedes T83) | exact runtime versions, plus `readiness()` over registry facts, withholding each version | **Assertion changed** to the exact runtime versions of hosting/F15 (typescript 5.9.3 among them). The `readiness()` and registry-facts clauses go. |
| hosting/T84 [hosting/F21, hosting/F22] | Hosting's record for a passing run, plus `verification()` accepts it | **Assertion changed:** the `verification()` call goes; every assertion on Hosting's own record (result, exit status, causes, cases) stays. Title loses "the unchanged Release judge accepts it". |
| hosting/T85 [hosting/F21, hosting/F22] | Hosting's failed/1 record, plus `verification()` | **Assertion changed** in the same way. |
| hosting/T86 [hosting/F21, hosting/F22] | Hosting's cannot verify/2 record, plus `verification()` returns unknown | **Assertion changed** in the same way. |

Not changed: hosting/T87, hosting/T173, hosting/T175 and every other Case. No new Case is added by this PLAN; hosting/T270 and hosting/T271 already exist.

## Allocations (`04-test/package-check/testing.md`, and the manifest generated from it)

- hosting/F15, hosting/F17 and hosting/A9: hosting/T83 is replaced by hosting/T174 in the list.
- hosting/F18 to hosting/F25: the words "and judge the records with the existing release contract" go. hosting/T84 to hosting/T87 stay allocated.

## Evidence the DO must show

- hosting/T270 passes, unmodified, and hosting/T271 still passes.
- `npm run test:publisher` passes, and CI is green at the DO's exact head, the installed-package Cases (hosting/T221 to hosting/T225) included.
- The Change record names the loss below and cites this PLAN and the ruling above.

## What is lost, and who decides what replaces it

The early signal. A Hosting change that would fail Engineering's readiness rules (a dependency not on the registry, a malformed verification record) used to fail in Hosting's own pull request. After the DO, Hosting's pull request judges neither. The judgment stays single, in Engineering's Package control. When that control runs on a package, and in particular whether it can run on a pull request that touches the package and not only when a release is prepared, is a decision for Engineering's Release management, not for Hosting. It is raised with that thread and is not assumed here.

## Not in scope

Hosting's verifier and its record, every Requirement, and any promotion to main.
