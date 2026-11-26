# release/C160: the check 1 replacement runs its check through the adapter

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. The source of the check 1 replacement (release/C153, C155) runs `npx --no kaal-guard run --check Change-Isolation`, the old control structure: no control record, no adapter path, no delivery map row. It installs first as it is (detective WIRE after C155), so the evidence compares like with like. This Change moves it onto the controls path before its enforcement swap.

## The contract
The source workflow's judge step runs a delivered entry `05-src/change-isolation/judge-change-isolation.mjs` instead of `kaal-guard`, with the same facts and the same fetch step. The entry runs `engineering/change-isolation/check.mjs` through the adapter in detective mode. T1571 pins the old command and is amended in this PLAN (its command expectation moves to the entry), without weakening the fetch, head-binding and property expectations.

## As a control
A control record `release/CTL39` (Change Isolation, preventive, not yet required) and a delivery map row at the next WIRE of the file. The installed copy is replaced by a WIRE of the new source, with its own go. The record `04-controls/CTL39-…` is part of the DO.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1581: the source `05-src/wiring/workflows/change-isolation-plain.yml` exists, is plain `pull_request`, has the workflow name `Change Isolation on pull_request`, unique, and the detective job name `Change Isolation (plain pull_request)`, and runs the entry, not `kaal-guard`. Red until the DO.
- T1582: the entry `05-src/change-isolation/judge-change-isolation.mjs` imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it. Red until the DO.

## DO
Change the source's judge step to run the entry; add the entry and the control record; amend T1571 in this PLAN. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## Order
This Change comes before the detective WIRE of check 1 (Owner: migrate check 1 as well). It builds on release/C155 on `main` (the source's workflow name), so its DO waits for that promotion. WIRE #2671 carried the old source and is left for the Owner to close; the WIRE is raised again from the migrated source after this Change's PROMOTION, with the Owner's go.

## After it
ACT, PROMOTION, then the detective WIRE of the file, which needs the Owner's go, and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Whether `engineering/change-isolation/check.mjs` exports a pure function over the facts (it is already a checker run through `change-isolation.sh`). Recommendation: wrap it as it is if it does; otherwise Engineering exports one first.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.
