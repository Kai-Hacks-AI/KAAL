# C1 change

## PLAN

1. Add the gap G114, the Intent I1, the Requirements F1 to F3 and N1 and the Architecture A1 under `packages/kaal-defect/`. Their Test Cases T1210 to T1214 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Test Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill, no script. `draft/` holds the intended Skill and script for review only.

## Ids

Proposed, to be confirmed by the allocator: Change defect/C1, Intent defect/I1, Requirements defect/F1 to F3 and N1, Architecture defect/A1, Test Cases T1210 to T1214, gap G114.

## What a Defect is, and who does what

A Defect is a passive description of an undesirable condition. It has no intrinsic known, fixed or open state. Three things are kept apart, and each has one owner:

- **The record and the register** (Defect): the description, where it was found, `placed` once Architecture sets it, and the links to Test Cases. `known` means the context lists the Defect in its register: membership, not a finding about the condition.
- **The observation** (Testing): whether the condition is `reproduced`, `not reproduced` or `unknown`. Testing derives it from execution observations of the linked Test Cases, at a revision, with the observation and probe mechanics Testing already has. Defect does not derive it, store it or read a result.
- **The policy** (the consumer or integration gate): what a registered or reproduced Defect allows.

## The flow (SIPOC, abstract handovers)

| | |
| --- | --- |
| **Suppliers** | Review (the finding, placed where it was found); Architecture (functional placement); Hosting (reading files) |
| **Inputs** | a Defect record and register entries `{defect, case}` in the `14-defects` of the context where it was found |
| **Process** | record the Defect where it was found; register it with its linked Test Cases; guard the entries; give the links; list it for its owner |
| **Outputs** | per Defect the ids of its linked Test Cases (`link <defect> <case>`); invalid entries; a to-fix list |
| **Customers** | Testing, which takes the linked Cases and observes them; the consumer or integration gate, which joins the register and Testing's observation and owns every policy decision; the owner each Defect is placed with |

Each handover is a plain value, so kaal-defect imports neither Review, Testing nor Architecture. State is distributed: every register is content of the context that holds it, and the package ships none.

## Rules

- **Links only.** The mechanic gives Test Case ids and reads no outcome, revision or result. One Defect may link several Cases.
- **Guard.** Every entry points at a Defect record in the same `14-defects` folder; one that does not is `invalid`. That a list only shrinks once Defects are placed is judged against the base revision, which Hosting reads (see kaal-hosting).
- **Found carries it.** The finding (see kaal-review) says where a Defect was found, and the record sits in the `14-defects` of that place until Architecture moves it. Architecture sets the functional placement as `placed` (see kaal-architecture); Defect reads it and never sets or judges it.
- **To-fix list.** The registered Defects grouped by `placed`, or by the holding context while there is none, each listed once.

## What Defect expects of Testing (not built here)

So that the observation lives where the mechanics are, Defect hands over its links and expects Testing to give back, per Defect, whether the condition is `reproduced`, `not reproduced` or `unknown`. The CPO asked that this be defined, so I state the semantics for Testing's sibling Change to adopt, and Defect implements none of it:

- An observation counts only if it names the revision judged. Another revision is stale. A missing observation, or any outcome other than pass or fail (unknown, skipped, errored, timed out, incomplete), is `unknown`.
- Several Cases: any applicable failing Case makes the condition `reproduced`. It is `not reproduced` only when every linked Case applicably passes. Otherwise it is `unknown`.
- `fixed` is not a stored Defect fact. A not-reproduced registered Defect only means the entry may be out of date.

Testing should reuse its existing observation mechanics for this. I found no Probe contract in `main` at 1168212 (nothing named Probe in kaal-testing, kaal-controls or engineering), so I cannot check that reuse against one; Testing's own reports already keep `unknown` with a stated reason and read a changed pinned digest as stale. Where the Probe contract lives is a question for the CPO.

## Who owns the end-to-end flow (revised proposal)

Revised after Kai's point that the register is content placed in context, with no central state. kaal-defect is only the mechanic, so I no longer propose that it owns the flow. I propose that no capability owns the flow end to end, and that each owns only its handover: Review the finding and where it was found, Testing the observation of the condition, Architecture the placement, kaal-defect the record, the register and the links. The knitting for KAAL (which runner feeds Testing, which gate consumes the register and Testing's observation, and where in CI they run) belongs to kaal-engineering, as with the other KAAL-specific setup, and is a Change of its own. This is a proposal for the CPO.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private), the Skill and the script as in `draft/`, route file reads through Hosting, and rename the Test Cases to `.test.mjs` when green. Nothing is published, wired to CI or registered as a control.

## ACT

A 4L retrospective in `act.md`.

## Left open

1. **Review and Testing siblings.** `@codex review` findings entering as a Defect and Testing's runner inverting known-RED results are separate Changes.
2. **Testing sibling Change.** Deriving reproduced, not reproduced or unknown from Test Case observations, with the semantics above, and handing it to the gate. Where the Probe contract lives is for the CPO; none exists in this revision.
3. **Folder.** `14-defects` is new; Hosting's `06-defects` stays and moves in a later Change of its own. Where a place has no `14-defects` yet, creating it is the first entry's job.
4. **Shrink rule.** "May only shrink" needs the base revision (Hosting) and a rule for when a new Defect enters. This PLAN states the guard but only the existence check is a Test Case.
5. **Hosting.** The draft reads files with Node directly; the DO routes it through Hosting.

## Not in this Change

No CI wiring, no control, no Core kind, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
