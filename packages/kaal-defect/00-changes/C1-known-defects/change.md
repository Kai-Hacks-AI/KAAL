# C1 change

## PLAN

1. Add the gap G114, the Intent I1, the Requirements F1 to F5 and N1 and the Architecture A1 under `packages/kaal-defect/`. Their Test Cases T1210 to T1216 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Test Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill, no script. `draft/` holds the intended Skill and script for review only.

## Ids

Proposed, to be confirmed by the allocator: Change defect/C1, Intent defect/I1, Requirements defect/F1 to F5 and N1, Architecture defect/A1, Test Cases T1210 to T1216, gap G114.

## Defect is like a Control

A Defect is what a Control is in the way that matters here: what it is about is usually free text, and its state is not declared but derived from the Test Cases that point at it. The same shape as Controls:

| | Control (see kaal-controls) | Defect |
| --- | --- | --- |
| The edge | the Case's first line `// Case <id> tests: <control id>` | the Case's first line `// Case <id> tests: <defect id>` |
| What it is about | free text (the declaration) | free text (the description, `expected`, `observed`) |
| Evidence | records `{case, x, run, outcome}`, outcome GREEN, RED or UNKNOWN as a runner reports it | records `{case, run, revision, outcome, covers}`, the same outcomes, and `covers` where `x` is |
| Judged by | the package's own judge over the records | the package's own judge over the records |
| Who runs the Cases | the repository that uses the package (Testing's runner) | the same: Testing |

So Testing runs the Cases and makes the records. Defect judges records, runs nothing, and imports no Testing. A Defect lists no Test Case; today Hosting's records do (`tests`), which is the legacy copy of this edge.

## State, derived each time

- A record counts only when it names the revision judged. A record of another revision is stale.
- A missing record, or any outcome other than GREEN or RED (skipped, errored, timed out, incomplete), is UNKNOWN, and UNKNOWN is never read as RED or GREEN.
- A Defect claims its reach (below), and a part of it that no GREEN applicable record covers counts toward UNKNOWN.
- A Case is RED if any applicable run is RED, GREEN if every applicable run is GREEN, otherwise UNKNOWN.
- A Defect is `confirmed` when some applicable Case is RED, even if every other Case is UNKNOWN: one RED Case is enough to show that the Defect exists. It is `answered` only when it has Cases, every applicable Case is GREEN with complete evidence, and every part of its claimed reach is covered. Without a RED and without complete GREEN evidence it is `unknown`, including when no Case points at it. These are the words Hosting's records already use for the status they claim.
- Several Cases pointing at one Defect are different manifestations, contexts or conditions of the same undesirable condition. They do not make several Defects and do not make several fix locations.
- Each Case's own outcome is kept alongside the derived state and is never merged into it: the output lists the Defect's state, then one line per Case with its outcome.
- The state is never stored on the Defect. A `status` a record claims today is a claim; showing a claim beside the derived state, as Controls does, is a later Change.

## Reach: where the condition can manifest

Each Defect claims its reach in its record (`reach:`), as parts of the repository: `.` for a condition that can manifest anywhere (a malformed Test Case), `packages/` for packages only (a malformed package structure), `.kaal/, engineering/` for what a failed package deployment touches. A Test Case covers a corner of that reach, and its record says which parts its run covered (`covers`), as a control's record says the kind of X it ran against. Rules:

- A claimed part that no GREEN applicable record covers counts toward `unknown` and is named, never toward `answered`.
- A covered part covers every part under it (`packages/` covers `packages/kaal-core`), and `.` covers all. Nothing is inferred the other way: several narrow Cases do not add up to a wider part unless the reach lists those parts.
- A Defect that claims no reach cannot be `answered`: there is nothing to say was covered. It is reported `reach unclaimed`.
- A RED applicable Case confirms the Defect whatever the reach. A stale or UNKNOWN run covers nothing.

The reach is also what a consumer such as Engineering's ratchet reads to know where a Defect applies. This PLAN only states and judges the claim; using it is that consumer's Change.

## The register

A context keeps `known.json` in its `14-defects` folder: a list of Defect ids that live in the same folder. `known` is only membership. An id with no Defect record in the same folder is `invalid`. There is no central register and the package ships none.

## The flow (SIPOC, abstract handovers)

| | |
| --- | --- |
| **Suppliers** | Review (the finding, placed where it was found); Testing (the Cases and the records of their runs); Architecture (functional placement); Hosting (reading files) |
| **Inputs** | a Defect record and a register in the `14-defects` of the context where it was found; Cases whose first line points at the Defect; records `{case, run, revision, outcome}`; the revision judged |
| **Process** | record the Defect where it was found; register it; judge its state from the records of its Cases; list it for its owner |
| **Outputs** | per Defect `<state> <defect>` and ` known` when registered, with each Case's own outcome beside it; invalid registry entries; a to-fix list |
| **Customers** | the consumer or integration gate, which joins the register and the state and owns every policy decision; the owner each Defect is placed with |

Each handover is a plain value, so kaal-defect imports neither Review, Testing nor Architecture.

## Rules

- **Found carries it.** The finding (see kaal-review) says where a Defect was found, and the record sits in the `14-defects` of that place until Architecture moves it. Architecture sets the functional placement as `placed` (see kaal-architecture); Defect reads it and never sets or judges it.
- **To-fix list.** The registered Defects that are not answered, grouped by `placed`, or by the holding context while there is none, each once.
- **Evidence, not policy.** The script prints states and fails only on unreadable input. Whether a registered or confirmed Defect may be tolerated is the consumer or integration gate's policy.
- **Guard.** That a register only shrinks once Defects are placed is judged against the base revision, which Hosting reads (see kaal-hosting).

## Reuse of Testing's mechanics (checked, not claimed)

The CPO asked that Testing's existing observation and probe mechanics be reused and that this be verified against the Probe contract in the revision. In `main` at 1168212 I found no Probe contract: nothing named Probe in kaal-testing, kaal-controls or engineering. Defect therefore takes the same record Controls takes, which a Case runner reports. Testing's own reports already keep `unknown` with a reason and read a changed pinned digest as stale. Where a Probe contract lives is an open question for the CPO.

## Who owns the end-to-end flow (proposal)

No capability owns the flow end to end, and each owns only its handover: Review the finding and where it was found, Testing the Cases and the records of their runs, Architecture the placement, kaal-defect the Defect, its register and its derived state. The knitting for KAAL (which runner makes the records, which gate consumes the register and the state, and where in CI they run) belongs to kaal-engineering, as with the other KAAL-specific setup, and is a Change of its own. This is a proposal for the CPO.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private), the Skill and the script as in `draft/`, route file reads through Hosting, and rename the Test Cases to `.test.mjs` when green. Nothing is published, wired to CI or registered as a control.

## ACT

A 4L retrospective in `act.md`.

## Left open

1. **Siblings.** `@codex review` findings entering as a Defect, and Testing making the records for the Cases that point at a Defect, are separate Changes.
2. **Claims.** Hosting's `status` and `tests` fields are legacy claims and a copy of the edge. Showing a claim beside the derived state, and migrating the records, are later Changes.
3. **Probe contract.** Where it lives, and whether it carries the record form, is for the CPO.
4. **Folder.** `14-defects` is new; Hosting's `06-defects` stays and moves in a later Change of its own.
5. **Shrink rule.** The guard against the base revision needs Hosting and is not a Test Case here.
6. **Hosting.** The draft reads files with Node directly; the DO routes it through Hosting.

## Not in this Change

No CI wiring, no control, no Core kind, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
