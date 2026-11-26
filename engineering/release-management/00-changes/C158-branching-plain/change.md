# release/C158: the plain pull_request replacement of Branching, on the controls path

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. Branching (`lineage-synchronization.yml`) runs `kaal-guard run --check Branching` on `pull_request_target`: it reads the event refs, the rules of the base branch through the API, the auto-merge method, and the proposed commits as Git data, then runs `engineering/github/lineage.ts`. Nothing of the candidate is run, so the same inputs are available on plain `pull_request`. Retiring the promotion-freshness verdict into the merge queue (release/I63, CTL32, C152, C136) is a later Change; this one is the same-checker replacement.

## The contract
A plain `pull_request` workflow, `branching-plain.yml`, with three jobs, one per verdict of `engineering/github/lineage.ts`, each with its own result: `Branching: freshness (plain pull_request)`, `Branching: synchronization (plain pull_request)`, `Branching: auto-merge (plain pull_request)`. Each job supplies the same facts as the old workflow (head, base, base ref, default branch, head ref, auto-merge method, the base rules file) and runs its own delivered entry under `05-src/lineage/`, not `kaal-guard`: `judge-freshness.mjs`, `judge-synchronization.mjs`, `judge-auto-merge.mjs`. An entry runs its verdict through the adapter in detective mode: its answer is the checker's verdict, an unreadable fact is UNKNOWN, never a pass. A failing verdict does not hide another.

## As a control
Three control records, `release/CTL37` (Branching: promotion freshness), `release/CTL38` (Branching: synchronization validity) and `release/CTL39` (Branching: auto-merge method), each preventive when required and not yet required, each with its own Intent and its own delivery map row. Ids by hand; on a clash the newer change renumbers. Each entry follows the C154 shape: the check is wrapped, the reads and the printing stay outside it. The records `04-controls/CTL37-` to `CTL39-` are part of the DO.

## Acceptance expectations (each verdict on its own)
- Freshness (CTL37): PASS when the promotion contains the default branch's tip and merging it yields exactly the tree validated on its head. FAIL otherwise. UNKNOWN when a fact cannot be read; never PASS. Not applicable when the base is not the default branch.
- Synchronization (CTL38): PASS when a merge commit gives the lineage a state of the default branch newer than the one it last incorporated, keeps its own outstanding Changes, and names its resolutions; or when it is fully current. FAIL for anything else proposed to a lineage that carries the default branch's history. UNKNOWN when a fact cannot be read.
- Auto-merge (CTL39): PASS when auto-merge is enabled with the method the flow names (squash into the default branch, merge into a lineage). FAIL when it is disabled, enabled with another method, or when the Branching verdict fails so no method is right. UNKNOWN when the base rules cannot be read.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1577: the source `05-src/wiring/workflows/branching-plain.yml` exists, is plain `pull_request`, has the workflow name `Branching on pull_request`, unique, the three detective job names, and runs the three entries, not `kaal-guard`. Red until the DO.
- T1578: each of the three entries imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it, with its own control id. Structure only. Red until the DO.
- T1583: the auto-merge entry gives the same verdict as `autoMerge` of `lineage.ts` for the four fact sets above (right method PASS; disabled FAIL; other method FAIL; no method FAIL). Behaviour, not structure.
- T1584: the freshness entry and the synchronization entry each answer a missing fact set with something other than PASS. UNKNOWN is never permission.
All red until the DO.

## DO
Add the source, the three entries and the three control records. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION, then a detective WIRE of the file, which needs the Owner's go and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Engineering dependency (CTO): `lineage.ts` already exports the pure verdicts `promotionFreshness`, `synchronization` and `autoMerge` over facts. What the entries need is that they can be imported from an `.mjs` entry. Recommendation: Engineering confirms or exports it in its own Change; until then the DO waits.
- The base rules are read with the workflow token. Recommendation: unchanged, `contents: read` only, and a response that cannot be read is UNKNOWN.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.

## Design: split and overlap
Split: three independent verdicts, three controls, as above. Related lineage verdicts that are not part of this check (landing, establishment, collector, working branch, claim) stay out.
Overlap, resolved here and not in DO. Nothing is dropped and no existing protection is reduced: the old workflow stays until each swap, and dropping an unreplaced check is the Owner's decision.
- Synchronization vs verify Sync (CTL7): not equivalent. CTL7 judges a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*` as a pure merge of main with a Reason, reading Git data and no API. CTL38 judges any pull request into a lineage: it also says that anything else proposed to a lineage is an ordinary Change that must not carry the default branch's history, and it names the resolutions. CTL7 is keyed on the title, which is not a kept semantic. So CTL38 is kept in full. Overlap is a later question: once a demonstrated equivalence exists, the Owner may drop one.
- Freshness vs queue Promotion (CTL32): not equivalent. CTL32 is a merge queue ruleset that lands promotions on the current tip; it operates only once the Owner has loaded it into the live ruleset and is proven equivalent. The queue makes freshness true when it lands; it does not report the verdict on the pull request, and today's `promoting` queue is not proven live. So CTL37 is kept. Retiring it into the queue is the later Change named in the Reason, with its own demonstration.
- Auto-merge method: not covered by any control. Kept.
