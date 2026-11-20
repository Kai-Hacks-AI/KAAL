# C1 change

## PLAN

1. Add the gap G114, the Intent I1, the Requirements F1 to F3 and N1 and the Architecture A1 under `packages/kaal-defect/`. Their Test Cases T1210 to T1214 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Test Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill, no script. `draft/` holds the intended Skill and script for review only.

## Ids

Proposed, to be confirmed by the allocator: Change defect/C1, Intent defect/I1, Requirements defect/F1 to F3 and N1, Architecture defect/A1, Test Cases T1210 to T1214, gap G114.

## The flow (SIPOC, abstract handovers)

| | |
| --- | --- |
| **Suppliers** | Review (the finding, placed where it was found); Testing (run results); Architecture (functional placement); Hosting (reading files and revisions) |
| **Inputs** | a Defect record and a register entry `{defect, case}` in the `14-defects` of the context where it was found; run results as a list `{case, outcome}`, `pass` or `fail` |
| **Process** | record the Defect where it was found; register its Test Case as known RED; judge every run against the registers in the tree; remove the entry when the Case is GREEN |
| **Outputs** | a verdict per Test Case: `known`, `fixed`, `blocking`, `unknown` or `invalid`; a to-fix list |
| **Customers** | the merge gate (it blocks on everything but `known`); the owner each Defect is placed with |

Each handover is a plain value, so kaal-defect imports neither Review, Testing nor Architecture. State is distributed: every register is content of the context that holds it, and the package ships none.

## Rules

- **Known RED.** A registered Test Case that fails is `known`: it does not block.
- **Strict.** A registered Test Case that passes is `fixed`: it blocks until its entry leaves the register, so a Defect cannot be fixed silently and cannot stay listed after it is fixed.
- **Unregistered fail** is `blocking`. A registered Case with no result is `unknown`, never a pass.
- **Guard.** Every entry points at a Defect record in the same `14-defects` folder; one that does not is `invalid`. That the list only shrinks once Defects are placed is judged against the base revision, which Hosting reads (see kaal-hosting).
- **Found carries it.** The finding (see kaal-review) says where a Defect was found, and the record sits in the `14-defects` of that place until Architecture moves it. Architecture sets the functional placement as `placed` (see kaal-architecture); Defect reads it and never sets or judges it.
- **To-fix list.** The entries of all registers grouped by `placed`, or by the holding context while there is none.

## Who owns the end-to-end flow (revised proposal)

Revised after Kai's point that the register is content placed in context, with no central state. kaal-defect is only the mechanic, so I no longer propose that it owns the flow. I propose that no capability owns the flow end to end, and that each owns only its handover: Review the finding and where it was found, Testing the run results, Architecture the placement, kaal-defect the verdict. The knitting for KAAL (which runner feeds the results, which gate consumes the verdicts, and where in CI they run) belongs to kaal-engineering, as with the other KAAL-specific setup, and is a Change of its own. This is a proposal for the CPO.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private), the Skill and the script as in `draft/`, route file reads through Hosting, and rename the Test Cases to `.test.mjs` when green. Nothing is published, wired to CI or registered as a control.

## ACT

A 4L retrospective in `act.md`.

## Left open

1. **Review and Testing siblings.** `@codex review` findings entering as a Defect and Testing's runner inverting known-RED results are separate Changes.
2. **Folder.** `14-defects` is new; Hosting's `06-defects` stays and moves in a later Change of its own. Where a place has no `14-defects` yet, creating it is the first entry's job.
3. **Shrink rule.** "May only shrink" needs the base revision (Hosting) and a rule for when a new Defect enters. This PLAN states the guard but only the existence check is a Test Case.
4. **Hosting.** The draft reads files with Node directly; the DO routes it through Hosting.

## Not in this Change

No CI wiring, no control, no Core kind, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
