# release/C160: the check 1 replacement runs its check through the adapter

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it, and check 1 is migrated before its detective WIRE, not installed first as the old source. The source of the check 1 replacement (release/C153, C155) is on the collector and runs `npx --no kaal-guard run --check Change-Isolation`, the old control structure: no control record, no adapter path, no delivery map row. This Change moves it onto the controls path before any WIRE. The old source is never installed. WIRE #2671 carried it and is left for the Owner to close.

## The contract
The source workflow keeps its fetch step and its plain `pull_request` trigger, and its judge step is replaced by two jobs, one per verdict, each with its own result: `Change Isolation: .github alone (plain pull_request)` and `Change Isolation: delivery (plain pull_request)`. Each runs its own delivered entry under `05-src/change-isolation/`, not `kaal-guard`: `judge-github-alone.mjs` and `judge-delivery.mjs`. Each entry runs `engineering/change-isolation/check.mjs` (`check` and `deliveryMixed`) through the adapter in detective mode. T1571 pins the old command and is amended in this PLAN (its command expectation moves to the entries), without weakening the fetch, head-binding and property expectations.

## As a control
- `.github` alone: a new control record `release/CTL42` (Change Isolation: `.github` alone, preventive, not yet required), with its own delivery map row.
- Delivery: no new record. The delivery-mixed rule is verify Delivery (release/CTL23), which today runs inside the old Change Isolation workflow. When that workflow retires it would lose its host, so the replacement hosts it: a delivery map row for `judge-delivery.mjs` under CTL23. Its record is amended only if its evidence or status wording needs it, in the DO.
Ids by hand; on a clash the newer change renumbers. The delivery map rows are written at the WIRE of the file, with its own go.

## Acceptance expectations (each verdict on its own)
- `.github` alone (CTL42): PASS when the change touches no `.github` path, or only `.github` paths. FAIL for each path outside `.github/` when the change touches any `.github` path. UNKNOWN when the paths cannot be read; never PASS. The transition ledger admits nothing the checker refuses today (engineering/change-isolation/README.md) and is not carried into this control; the entry judges the paths as the checker does and the ledger inputs stay unsupplied, so a ledger entry cannot admit anything.
- Delivery (CTL23): PASS when the change touches no delivery location, or only delivery paths. FAIL (finding) for each non-delivery path when it touches a delivery location, a declared root or a root file. Detective: it never gates. UNKNOWN when the delivery declaration cannot be read.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1581: the source `05-src/wiring/workflows/change-isolation-plain.yml` exists, is plain `pull_request`, has the workflow name `Change Isolation on pull_request`, unique, the two detective job names, no `pull_request_target`, and runs the two entries, not `kaal-guard`.
- T1582: each of the two entries imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it, with its own control id (CTL42, CTL23). Structure only.
- T1587: the `.github` alone entry passes a change inside `.github` and a change with no `.github` path, fails a change that mixes `.github` and another path, and does not pass an unreadable path set. Behaviour, not structure.
- T1590: the entries judge a change as the old workflow did. A verified synchronization of a collector is judged by its own explicit resolutions only, as the default branch's lineage verdict (`engineering/github/lineage.ts`, read from the default branch, never from the candidate) names them: what main carried into the collector is not its change, and a synchronization with no resolutions of its own has nothing to judge. A head already on the default branch does not apply. Any other change into a collector is judged whole. A verified synchronization is not skipped: one whose explicit resolutions mix `.github` with another path is reported, and a lineage verdict that cannot be read (the default branch holds no `lineage.ts`) is UNKNOWN with exit 2, never a pass. Behaviour with real Git. Added by amendment (see "Amendment").
- T1588: the delivery entry reports a non-delivery path next to a delivery path, reports nothing for a change with no delivery path, and does not pass when the delivery declaration cannot be read. Behaviour, not structure.
All red until the DO.

## DO
Change the source's judge step into the two jobs; add the two entries and the CTL42 record; amend T1571 in this PLAN. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## Order
This Change comes before the detective WIRE of check 1 (Owner: migrate check 1 as well; adapter migration before the WIRE, not the old source first). It builds on release/C155 on `main` (the source's workflow name), so its DO waits for that promotion. WIRE #2671 carried the old source and is left for the Owner to close. The WIRE is raised from the migrated source after this Change's PROMOTION, with the Owner's go. No WIRE or enforcement is authorized by this PLAN.

## After it
ACT, PROMOTION, then the detective WIRE of the file, which needs the Owner's go, and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- `check.mjs` exports `check(paths, ...)` and `deliveryMixed(paths, ...)`, both over facts, so the entries can wrap them as they are; no Engineering Change is needed for the pure part. The entries import it from `engineering/change-isolation/check.mjs` by a relative path. Confirm in the DO that the import has no side effect (the file also holds a command line part).
- Whether the transition ledger is retired in the same pass. Recommendation: no, its retirement is its own Change (engineering/change-isolation/README.md).

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.

## Design: split and overlap
Correction to an earlier version of this PLAN: it named "Core travels alone" and verified synchronization as rules of this check. They are not: "Core travels alone" was retired (release/C98) and `check.mjs` has no synchronization rule. The checker has two verdicts only.
Split: two independent verdicts, two controls, as above: `.github` alone (path-level, may gate) and delivery-mixed (detective, never gates). One failing does not hide the other.
Overlap, resolved here and not in DO. Nothing is dropped and no existing protection is reduced: the old workflow stays until its swap.
- Delivery-mixed vs verify Delivery (CTL23): it is the same rule. It is not copied: the replacement hosts CTL23 through its own entry, so there is one control and no duplicate. This also keeps CTL23's evidence alive when the old workflow retires.
- Verified synchronization vs verify Sync (CTL7): `check.mjs` has no such rule, so there is no overlap with CTL7 in this check. Branching (C158) owns synchronization validity.
- isolate Changes (CTL33) judges collectors, not pull requests into main, so it does not cover the `.github` rule.
- `.github` alone is covered by no other control on main. Kept.

## Amendment (CPO hold on the DO, #2737)
Two corrections to this PLAN, found when the DO was reviewed.
1. **The semantics of a verified synchronization are preserved.** The correction above said the checker has no synchronization rule. That is true of `check.mjs`, but the old workflow script (`engineering/github/change-isolation.sh`) judged a verified synchronization of a collector by its explicit resolutions only, and answered "does not apply" for a head already on the default branch. The entries keep both, through the same lineage verdict as the old script, so nothing is dropped and the check does not regress for a SYNC. New Case T1590 (parked red, ids by hand). The entries take the default branch from `KAAL_DEFAULT`, which the workflow step already supplies. A lineage verdict that cannot be read is UNKNOWN, never a pass. This replaces the "Known gap" the DO had recorded, which asked for an Owner acceptance that is no longer needed.
2. **The job-name expectation of release/T1575 (C155) is superseded, not repaired.** T1575 pinned the one job name `Change Isolation (plain pull_request)`. The two-job contract of this PLAN replaces that name with the two names below, so the expectation is superseded. What T1575 is for stays: the workflow name is its own and unique, and no job takes the required context `Change Isolation`. The DO narrows T1575 to exactly that, and T1571's job-name line follows the first of the two names. The two job names are written quoted in YAML because they hold `: `.
