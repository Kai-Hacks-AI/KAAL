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
| **Suppliers** | Review or Testing or a person (a finding); Testing (run results); Hosting (reading files and revisions) |
| **Inputs** | a Defect record; a register entry `{defect, case}`; run results as a list `{case, outcome}`, where outcome is `pass` or `fail` |
| **Process** | record the Defect where it was found; register its Test Case as known RED; judge every run against the register; remove the entry when the Case is GREEN |
| **Outputs** | a verdict per Test Case: `known`, `fixed`, `blocking` or `unknown`; a to-fix list per owner |
| **Customers** | the merge gate (it blocks on `fixed`, `blocking` and `unknown`, and passes `known`); the owners of the Defects |

Each handover is a plain value. The run results are a list of `{case, outcome}`, so kaal-defect does not import Testing and Testing does not import kaal-defect. A finding enters as a Defect record plus an entry; how Review or Testing produces them is for their own Changes, sibling to this one.

## Rules

- **Known RED.** A registered Test Case that fails is `known`: it does not block.
- **Strict.** A registered Test Case that passes is `fixed`: it blocks until its entry leaves the register, so a Defect cannot be fixed silently and cannot stay listed after it is fixed.
- **Unregistered fail** is `blocking`. A registered Case with no result is `unknown`, never a pass.
- **Guard.** Every entry points at an existing Defect record; one that does not is `invalid`. Which entries may be added, and that the list may only shrink once its Defects are placed, is judged against the base revision, which Hosting reads (see kaal-hosting).
- **Found carries it.** The finding (Review) says where a Defect was found, and the record sits in the `14-defects` of that place. It stays there until Architecture moves it. Architecture sets the functional placement as `placed`; Defect reads it, never sets it and never judges it. Testing supplies the run results and Review the finding; neither is imported.
- **To-fix list.** The register grouped by `placed`, or by `found` while there is none.

## Who owns the end-to-end flow (proposal)

The flow crosses Review (finds), Testing (proves and runs), Defect (records and judges) and the gate. I propose two owners and no more. kaal-defect owns the flow as an abstract definition, since it is the only step that holds state (the register) and the only one the others must agree with. kaal-engineering owns KAAL's own wiring of it (which runner feeds it, which gate consumes it), as with the other KAAL-specific setup. Every neighbour owns only its own handover. This is a proposal for the CPO.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private), the Skill and the script as in `draft/`, route file reads through Hosting, and rename the Test Cases to `.test.mjs` when green. Nothing is published, wired to CI or registered as a control.

## ACT

A 4L retrospective in `act.md`.

## Left open

1. **Review and Testing siblings.** `@codex review` findings entering as a Defect and Testing's runner inverting known-RED results are separate Changes.
2. **Folder.** `14-defects` is new; Hosting's `06-defects` stays and moves in a later Change of its own.
3. **Shrink rule.** "May only shrink" needs the base revision (Hosting) and a rule for when a new Defect enters. This PLAN states the guard but only the existence check is a Test Case.
4. **Hosting.** The draft reads files with Node directly; the DO routes it through Hosting.

## Not in this Change

No CI wiring, no control, no Core kind, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
