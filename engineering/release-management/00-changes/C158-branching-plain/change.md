# release/C158: the plain pull_request replacement of Branching, on the controls path

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. Branching (`lineage-synchronization.yml`) runs `kaal-guard run --check Branching` on `pull_request_target`: it reads the event refs, the rules of the base branch through the API, the auto-merge method, and the proposed commits as Git data, then runs `engineering/github/lineage.ts`. Nothing of the candidate is run, so the same inputs are available on plain `pull_request`. Retiring the promotion-freshness verdict into the merge queue (release/I63, CTL32, C152, C136) is a later Change; this one is the same-checker replacement.

## The contract
A plain `pull_request` workflow that supplies the same facts as the old one (head, base, base ref, default branch, head ref, auto-merge method, the base rules file) and runs a delivered entry, `05-src/lineage/judge-branching.mjs`, not `kaal-guard`. The entry runs the checker through the adapter in detective mode: its answer is the checker's verdict, an unreadable fact is UNKNOWN, never a pass.

## As a control
A control record `release/CTL37` (Branching, preventive, not yet required) and a delivery map row for the delivered file at the WIRE. The entry follows the C154 shape: the check is wrapped, the reads and the printing stay outside it. The record `04-controls/CTL37-…` is part of the DO.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1577: the source `05-src/wiring/workflows/branching-plain.yml` exists, is plain `pull_request`, has the workflow name `Branching on pull_request`, unique, and the detective job name `Branching (plain pull_request)`, and runs the entry, not `kaal-guard`. Red until the DO.
- T1578: the entry `05-src/lineage/judge-branching.mjs` imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it. Red until the DO.

## DO
Add the source, the entry, and the control record. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION, then a detective WIRE of the file, which needs the Owner's go and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Whether `engineering/github/lineage.ts` exports a pure function over the facts. Recommendation: Engineering exports one in its own Change first if it does not; until then the entry cannot wrap the check and this Change waits for it (a real dependency).
- The base rules are read with the workflow token. Recommendation: unchanged, `contents: read` only, and a response that cannot be read is UNKNOWN.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.
