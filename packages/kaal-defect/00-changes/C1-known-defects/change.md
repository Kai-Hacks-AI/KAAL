# C1 change

## PLAN

1. Add the gap G114, the Intent I1, the Requirements F1 to F3 and N1 and the Architecture A1 under `packages/kaal-defect/`. Their Test Cases T1210 to T1214 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Test Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill, no script. `draft/` holds the intended Skill and script for review only.

## Ids

Proposed, to be confirmed by the allocator: Change defect/C1, Intent defect/I1, Requirements defect/F1 to F3 and N1, Architecture defect/A1, Test Cases T1210 to T1214, gap G114.

## What a Defect is, and what is evidence

A Defect is a passive description of an undesirable condition. It has no intrinsic known, fixed or open state. Three things are kept apart:

- **The record**: the description, where it was found, and `placed` once Architecture sets it. Defect owns the record form.
- **Registration**: `known` means the context lists the Defect in its register. It is membership, not a finding about the condition.
- **Observation**: connected Test Cases and their execution observations, at a revision, give evidence whether the condition is `reproduced`, `not reproduced` or `unknown`. It is derived each time and never stored on the Defect, so `fixed` is not a Defect fact.

## The flow (SIPOC, abstract handovers)

| | |
| --- | --- |
| **Suppliers** | Review (the finding, placed where it was found); Testing (observations of Test Cases); Architecture (functional placement); Hosting (reading files and the revision) |
| **Inputs** | a Defect record and register entries `{defect, case}` in the `14-defects` of the context where it was found; observations `{case, outcome, revision}`, where outcome is `pass`, `fail` or `unknown`; the revision judged |
| **Process** | record the Defect where it was found; register it; derive its observation at the revision from its connected Cases; list it for its owner |
| **Outputs** | per registered Defect: `reproduced`, `not reproduced` or `unknown`; failing Cases no register lists; invalid entries; a to-fix list |
| **Customers** | the consumer or integration gate, which owns every policy decision; the owner each Defect is placed with |

Each handover is a plain value, so kaal-defect imports neither Review, Testing nor Architecture. State is distributed: every register is content of the context that holds it, and the package ships none.

## Rules

- **Applicable evidence.** An observation counts only if it names the revision judged. An observation of another revision is stale, and a missing observation or any outcome other than `pass` or `fail` (unknown, skipped, errored, timed out, incomplete) is `unknown`. None of them is ever read as reproduced or as not reproduced.
- **Several Cases.** Any applicable failing Case makes the condition `reproduced`. It is `not reproduced` only when every connected Case applicably passes. Otherwise it is `unknown`. A mix of pass and fail is `reproduced`, since a pass says nothing about what another Case shows.
- **Not reproduced.** For a registered Defect this means the register may be out of date. It is an observation, and whether the entry must leave is policy.
- **Evidence, not policy.** The script prints observations and fails only when it cannot read its input. Whether a reproduced or registered Defect may be tolerated is the consumer or integration gate's policy.
- **Guard.** Every entry points at a Defect record in the same `14-defects` folder; one that does not is `invalid`. That a list only shrinks once Defects are placed is judged against the base revision, which Hosting reads (see kaal-hosting).
- **Found carries it.** The finding (see kaal-review) says where a Defect was found, and the record sits in the `14-defects` of that place until Architecture moves it. Architecture sets the functional placement as `placed` (see kaal-architecture); Defect reads it and never sets or judges it.
- **To-fix list.** The registered Defects grouped by `placed`, or by the holding context while there is none.

## Reuse of Testing's observation mechanics (checked, not claimed)

The CPO asked that Testing reuse the observation and probe mechanics it has, not a Defect-specific one, and that this be verified against the existing Probe contract in the revision. In `main` at 1168212 I found no Probe contract: there is no `Probe` in kaal-testing, kaal-controls or engineering, and the only probe in `main` is a Change-internal word in other packages. What kaal-testing does have is a report of classes with `unknown` and a stated reason, and a "stale" reading when a pinned digest no longer matches the bytes. So this PLAN keeps the interface to a plain observation list and does not claim a Probe reuse it cannot check. Defect runs nothing, so any later Probe mechanics produce the same `{case, outcome, revision}` for Testing to hand over, with no Defect-specific execution. Where the Probe contract lives, I do not know; that is an open question for the CPO.

## Who owns the end-to-end flow (revised proposal)

Revised after Kai's point that the register is content placed in context, with no central state. kaal-defect is only the mechanic, so I no longer propose that it owns the flow. I propose that no capability owns the flow end to end, and that each owns only its handover: Review the finding and where it was found, Testing the observations (`pass`, `fail`, `unknown`, at a revision), Architecture the placement, kaal-defect the record, the register and the derived observation. The knitting for KAAL (which runner feeds the results, which gate consumes the observations, and where in CI they run) belongs to kaal-engineering, as with the other KAAL-specific setup, and is a Change of its own. This is a proposal for the CPO.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private), the Skill and the script as in `draft/`, route file reads and the revision through Hosting, and rename the Test Cases to `.test.mjs` when green. Nothing is published, wired to CI or registered as a control.

## ACT

A 4L retrospective in `act.md`.

## Left open

1. **Review and Testing siblings.** `@codex review` findings entering as a Defect and Testing's runner inverting known-RED results are separate Changes.
2. **Probe contract.** Where the Probe contract lives, and whether it should carry the observation form, is for the CPO; none exists in this revision.
3. **Folder.** `14-defects` is new; Hosting's `06-defects` stays and moves in a later Change of its own. Where a place has no `14-defects` yet, creating it is the first entry's job.
4. **Shrink rule.** "May only shrink" needs the base revision (Hosting) and a rule for when a new Defect enters. This PLAN states the guard but only the existence check is a Test Case.
5. **Hosting.** The draft reads files with Node directly; the DO routes it through Hosting.

## Not in this Change

No CI wiring, no control, no Core kind, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
