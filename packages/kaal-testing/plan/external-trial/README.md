# Review External trial (review/T20): Testing's evidence plan

This is a PLAN Change for Testing. It ships no code, export, package or promotion. It answers Review's T20 (review PLAN #984, DO #1012 merged) and Product's External bar (#978 section 6): how the independent trial of Review is run and recorded as evidence. It does not run the trial, and it does not claim Review is External-ready. Testing records what is observed; the Owner decides readiness.

## What is under test

The text of `kaal/review` at a named commit, as an outside consumer receives it: `skills/kaal-review/SKILL.md`, its `references/` (including `standalone.md`) and the two optional scripts. At this writing the head is `abdb905065052ec04cfc3c9eb3ecc20f46e9320b` (after #1012). The trial names the commit it used; if `kaal/review` moves, the earlier trial shows nothing about the new text and a new Run is needed (`testing/F31`).

## Scope of this trial

CPO review (5 Nov): the External product model is wider than this trial. A KAAL-primed Agent may use Review as the work, and other capabilities (for example Architecture) as lenses on an unrelated target, with writes when the target's owner authorizes and the capability declares them. A standalone, read-only review is one case of that model, not its definition.

This plan therefore measures one narrow thing: whether Review's own text, given to an Agent as plain text, gives the Owner a **useful** validation of a real change, meaning a record that helps decide whether the change serves the Intent its Owner gave it, with its effects declared and any writes authorized. Review is validation and Testing is verification (Owner, 5 Nov): finding real defects is verification, so it is not scored here. Judgment is semantics, so the trial does not claim the verdict is correct. It asks only whether the record is useful, which the person who would use it can rate. It does not test lenses, composition or other capabilities, and whatever it shows about Review says nothing about them (testing/F31: a Run of one text shows nothing about another). It states no acceptance bar and no External readiness. A later trial that adds a lens or an authorized write is a separate Plan and a separate Run.

## Who does what

| Part | Owner |
| --- | --- |
| The claims under test (`review/E6`) and the Skill text | Review |
| The bar: unrelated repository, plain text at a version, real task, independent checker, effects checked (#978 section 6) | Product |
| The task: a real task done by the cold performing Agent, a fresh Claude session given only the Review text and the task | the performing Agent (session A) |
| The judgment: the performing Agent's work checked against the claims | the independent checker, chosen by the Owner (3 Nov) as a fresh Claude session with no KAAL context (session B, never session A and never the Testing thread); validation, reasoned judgment |
| Review of the checker's verdict | Kai or the CPO; recorded beside the Run, never replacing the checker's classification |
| The Plan and the Run as evidence: Cases, three results, provenance, Test Data | Testing (this PLAN) |
| Calling Review External-ready | the Owner |

Testing is not the checker and not the cold Agent. Both would have to be unprimed by KAAL beyond the text under test, and the Testing thread is primed. Testing also does not choose the repository or the task.

## The Plan

`trial-plan.json` is an ordinary Plan of Testing's own model, with nothing new: Plan `review/T20`, four Suites (independence, claims, effects, pin) and twelve Cases, one per decidable criterion of #978 section 6 and `review/E6`. `check` over it gives no findings, and a dry Run over it behaves as the model says (all passed, one skipped gives unknown, one failed gives failed). The Plan holds five Test Data items (subject commit, consumer repository, checker, task, intent and usefulness), recorded by the checker as the Run's effective Test Data (`testing/F31`, `F32`).

## Running it

1. **Choose and state the Intent.** Someone other than the author of Review (the CPO, for the Owner) chooses an unrelated repository and a real pending change in it, and the Owner states in writing the Intent the change is for, with what would show it is served. The Intent, the checklist below and the bar are recorded before Review runs. Choosing is Product's or the Owner's, not Testing's.
2. **Deliver plain text only.** The Agent receives a read-only copy of the Review files at the named commit, with the file hashes recorded. No Engine, installation or registration, and no other KAAL text.
3. **Authorize.** The target's owner or context states in writing what writes the Agent may make. If Review declares none for itself, the Agent may still be authorized to post the record to the target.
4. **Snapshot, run, snapshot.** The target is captured before and after (for a git repository, the tree and refs). The Agent does the review.
5. **Judge.** The checker records one outcome per Case in the model's own outcomes, `passed` or `failed`, each with a reason. A Case the checker cannot decide, skipped or unobserved, is recorded as `skipped` or left out of `outcomes`, never as a literal `unknown`: `unknown` is a result the model derives (`testing/F26`), not an outcome it accepts, and recording it would add a finding that turns a failed evaluation into unknown. The reason for every Case, including the undecided ones, is kept in the trial record beside the Run. The checker records the Intent, Review's record, the checklist results and the CPO's usefulness rating in the Test Data.
6. **Record.** One Run of `review/T20`, with provenance naming the Plan, its Suites and the Cases at their versions, and the Test Data as recorded. The consumer keeps the Run; Testing keeps none (`testing/F33`).

## Evidence rules

- **Three results, unknown never passed.** The trial's result is the model's: failed if any Case failed, otherwise unknown if any is unknown, otherwise passed (`testing/F27`). A Case recorded as `skipped` or left out is `unknown` in the result, and never counts as passed.
- **Truth is only deterministic.** Owner's principle (5 Nov): truth must rest on hard deterministic facts, and an argument that is not deterministic is not truth. In this trial a **fact** is something anyone can re-derive from recorded inputs by a script or a test. Everything else is a **judgment**: it is recorded as judgment, with its reason and who made it, and is never worded as truth. Review's record and the checker's and CPO's assessments are judgments about usefulness. A Case that passes on judgment means "judged met by this person", not "true".
- **Verification and validation stay apart.** Three Cases are deterministic and are re-run by anyone from the recorded inputs: `record-valid` (run `check-record` on the record), `cited-version` (the recorded hashes match the commit) and the effect diff behind `effects-declared`. The rest are the checker's judgment, recorded as judgment with the reason. `useful-for-validation` is judged by the checklist and the CPO's rating of usefulness, not by whether the record validated or no write occurred, not by how many defects Review found, and not by whether its verdict is right.
- **kaal-review judges, kaal-testing proves (Owner, 5 Nov).** This maps onto the escalation ladder (bare Agent, Agent instructions, Skill, Script): the step from validation to verification lies between Skill and Script. Review's record is produced on the **Skill side**: it is judgment, worded as judgment, and claims no proof. Nothing in this plan states or implies that Review proves anything, and no Case treats Review's record as proof. Proof is only on the **Script side**: what a script or test re-derives from recorded inputs (`check-record`, hash comparison, the effect diff) and the model's own derivation of the three results from the recorded outcomes. Testing proves only those. Where a Case rests on judgment, the Run records it as judgment, who made it and why.
- **Absence of writes is not a pass.** `effects-declared` and `writes-authorized` pass only when each observed effect is a declared one and each write has the target's authorization.
- **Nothing is certified.** A failed Case returns to Review as a Finding. A Finding the checker confirms becomes a Defect in Review's context, in the shape of the Defect record (#991), with a RED Case in Review's own Defect Plan (`review/E7`). An unconfirmed Finding is answered with reasoning. The result is input to the Owner's decision and never a gate.

## Rubric for `useful-for-validation`

Review validates: it helps decide whether the change serves its Intent. "Correct" is semantic judgment and is not a bar this trial can manage, so it is not scored. "Useful" can be: the checker applies a four-item checklist to the record, and the CPO, who would use the record, rates it. Each item has a **deterministic part**, a fact a script re-derives (listed in the last column), and a **judged part**, recorded as judgment and never as truth. Testing fixes the checklist and what is recorded; the bar stays an Owner choice (see below).

| Checklist item | Met when | Evidence the checker records |
| --- | --- | --- |
| U1 Intent restated | The record restates the Intent and what would show it served, and the Owner recognizes it as the Intent they gave. | The restatement and the Owner's recognition (yes or no, with the difference). |
| U2 Traced to the change | For each Intent clause, the record points at where the change bears on it, so a person can follow it. | The clauses, the pointers, and any clause left unaddressed. |
| U3 What to observe | The record leaves the person what to look at or decide next (`review/E6`). | The items. |
| U4 Limits stated | The record says what it did not examine or could not judge, and makes no claim of "served", "not served" or "complete" about anything it did not examine. | The stated limits, and any claim made about something not examined (false certainty). |

| Item | Deterministic part (a fact; script or test) | Judged part (recorded as judgment) |
| --- | --- | --- |
| U1 | The record has an Intent section and quotes the Owner's stated Intent text unchanged. | The Owner recognizes the restatement. |
| U2 | Every pointer in the record resolves to an existing path and line in the change; every Intent clause has at least one pointer or is listed as unaddressed. | That the pointers bear on the clause. |
| U3 | The record has a non-empty to-observe list (`check-record`). | That the items help. |
| U4 | The record has a non-empty limits list. | That no claim covers what was not examined. |

The CPO then rates the record: **useful** (it made the decision easier or showed something the CPO would not have had), **partly useful** (some of it did), or **not useful**. The rating comes with a reason. It is the CPO's, never the checker's. It is a judgment of usefulness, recorded as judgment with its reason, and it is not a claim that Review's verdict is correct or true.

Pass, fail and undecided for the Case:
- **passed** only when every checklist item is met and the CPO's rating meets the precommitted option's line.
- **failed** when any checklist item is not met (including any false certainty under U4), or the CPO rates it below the line.
- **skipped** when the checker cannot decide an item, or the CPO does not rate, unless another part already decides it as failed.

Defects Review happens to find are recorded as input for Testing and the owning capability. They are not credit and not penalty for this Case. Counts and ratings are recorded in `review/T20/intent-and-usefulness`. Testing records them and does not choose the bar.

### Acceptance bar options (Owner chooses and precommits before the trial)

The bar, the Intent, the checklist and the repository and change are written into the Run's Test Data before the Agent starts, and are not changed after Review's first record is seen. Testing offers these options and chooses none.

| Option | Checklist U1 to U4 | CPO rating needed | Meaning of a pass |
| --- | --- | --- | --- |
| A. Useful (proposed) | all four met | useful | Review's record helped the CPO decide and was honest about its limits. |
| B. At least partly useful | all four met | partly useful or better | The record met the form and helped in part. |
| C. Record only | recorded | recorded; the CPO decides | no pass line; only this Case is `skipped` |

Under A and B the Case is `failed` when the line is missed, and each miss returns to Review as a Finding. Under C only `useful-for-validation` is recorded `skipped` with the checklist and rating, so it never reads as passed; every other Case keeps its observed outcome.

The compact decision comparison for the Owner, with the definitions, consequences and target safety, is in `decision-comparison.md`. Neither option is accepted by default.

### Selecting the repository and task

Decided by the Owner (5 Nov): the target kind is **a real pending change in one of the Owner's own non-KAAL repositories**, in a throwaway copy of the branch, **through the CPO**. The CPO selects the repository and change, obtains the Owner's written authorization for the copy, and reviews the checker's verdict. The Owner is not the judge. The author of Review and Testing take no part in the selection. The selection, who made it and when are recorded in `review/T20/consumer-repository` and `review/T20/task` before the Agent runs. The repository and change are not chosen yet, and nothing runs until the Owner separately authorizes the start. A merged public pull request and a synthetic repository are not used.

### Checker calibration

Before the trial the checker is calibrated, and the record shows it:
1. The Intent, the checklist and the bar are written down before the Agent runs, and kept with the Run.
2. The checker applies the checklist to a small known set first, such as pre-written records with a known item met, an item not met and a false certainty, and the result is compared to the expected one. Disagreements are written down with the reason.
3. For a second pass, a second independent checker applies the checklist to the same record without seeing the first result; agreement per item is recorded, and every disagreement is resolved in writing or left as `skipped` for that item.
4. The checker's identity (a fresh Claude session: its model and the context it was given), its relation to the author of Review, and any KAAL exposure beyond the text under test go into `review/T20/checker`. The CPO's rating is recorded beside the Run and does not replace the checker's checklist result.

A calibration that fails (the checker misapplies the checklist on the known set) means the Case `checker-independent` is not passed, and the trial does not count.

## Open points

These are explicit Owner choices. Testing does not choose them silently, and the Plan does not start the trial.

- Decided by the Owner (3 Nov): the independent checker is a fresh Claude session with no KAAL context, and Kai or the CPO reviews its verdict. The performing Agent and the checker are separate sessions: the checker is not told how the Agent was prompted beyond the recorded task and does not share its context. The verdict review is recorded in the trial record, and the Run is kept in the consumer context (`testing/F33`). Decided (5 Nov): the target is a real pending change in an Owner non-KAAL repository, selected and authorized through the CPO, who also reviews the verdict. Still open: the repository and change themselves.
- The acceptance bar for `useful-for-validation` (A useful, B at least partly useful, or C record only). Testing records the checklist and the rating and does not choose the bar.
- The repository, the change and its Intent, and the size of the calibration set.
- Whether Product's Decision Preparation cites the Run by commit (the Run itself is kept in the consumer context).
- Whether a Review change after the trial, such as a fix for a Finding, needs a full new Run or only the affected Cases. The model reads a Run of another version as showing nothing, so it needs at least those Cases.

No promotion or publication is authorized.
