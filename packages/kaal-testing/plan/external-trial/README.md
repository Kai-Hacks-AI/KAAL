# Review External trial (review/T20): Testing's evidence plan

This is a PLAN Change for Testing. It ships no code, export, package or promotion. It answers Review's T20 (review PLAN #984, DO #1012 merged) and Product's External bar (#978 section 6): how the independent trial of Review is run and recorded as evidence. It does not run the trial, and it does not claim Review is External-ready. Testing records what is observed; the Owner decides readiness.

## What is under test

The text of `kaal/review` at a named commit, as an outside consumer receives it: `skills/kaal-review/SKILL.md`, its `references/` (including `standalone.md`) and the two optional scripts. At this writing the head is `abdb905065052ec04cfc3c9eb3ecc20f46e9320b` (after #1012). The trial names the commit it used; if `kaal/review` moves, the earlier trial shows nothing about the new text and a new Run is needed (`testing/F31`).

## Scope of this trial

CPO review (5 Nov): the External product model is wider than this trial. A KAAL-primed Agent may use Review as the work, and other capabilities (for example Architecture) as lenses on an unrelated target, with writes when the target's owner authorizes and the capability declares them. A standalone, read-only review is one case of that model, not its definition.

This plan therefore measures one narrow thing: whether Review's own text, given to an Agent as plain text, lets the Agent **validate** a real change, meaning judge correctly whether it serves the Intent its Owner gave it, with its effects declared and any writes authorized. Review is validation and Testing is verification (Owner, 5 Nov): finding real defects is verification, so it is not what this trial scores. It does not test lenses, composition or other capabilities, and whatever it shows about Review says nothing about them (testing/F31: a Run of one text shows nothing about another). It states no acceptance bar and no External readiness. A later trial that adds a lens or an authorized write is a separate Plan and a separate Run.

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

`trial-plan.json` is an ordinary Plan of Testing's own model, with nothing new: Plan `review/T20`, four Suites (independence, claims, effects, pin) and twelve Cases, one per decidable criterion of #978 section 6 and `review/E6`. `check` over it gives no findings, and a dry Run over it behaves as the model says (all passed, one skipped gives unknown, one failed gives failed). The Plan holds five Test Data items (subject commit, consumer repository, checker, task, intent and key), recorded by the checker as the Run's effective Test Data (`testing/F31`, `F32`).

## Running it

1. **Choose and state the Intent.** Someone other than the author of Review (the CPO, for the Owner) chooses an unrelated repository and a real pending change in it, and the Owner states in writing the Intent the change is for, with what would show it is served. **Before Review runs**, the Owner, through the CPO, records a blind judgment (the key): serves, serves in part (and what is missing), or does not serve, with reasons. Under option A a control is added: the same change with a different, deliberately mismatched Intent that the Owner states it does not serve. Choosing is Product's or the Owner's, not Testing's.
2. **Deliver plain text only.** The Agent receives a read-only copy of the Review files at the named commit, with the file hashes recorded. No Engine, installation or registration, and no other KAAL text.
3. **Authorize.** The target's owner or context states in writing what writes the Agent may make. If Review declares none for itself, the Agent may still be authorized to post the record to the target.
4. **Snapshot, run, snapshot.** The target is captured before and after (for a git repository, the tree and refs). The Agent does the review.
5. **Judge.** The checker records one outcome per Case in the model's own outcomes, `passed` or `failed`, each with a reason. A Case the checker cannot decide, skipped or unobserved, is recorded as `skipped` or left out of `outcomes`, never as a literal `unknown`: `unknown` is a result the model derives (`testing/F26`), not an outcome it accepts, and recording it would add a finding that turns a failed evaluation into unknown. The reason for every Case, including the undecided ones, is kept in the trial record beside the Run. The checker records the Intent, the Owner's blind judgment, Review's judgment and the control result in the Test Data.
6. **Record.** One Run of `review/T20`, with provenance naming the Plan, its Suites and the Cases at their versions, and the Test Data as recorded. The consumer keeps the Run; Testing keeps none (`testing/F33`).

## Evidence rules

- **Three results, unknown never passed.** The trial's result is the model's: failed if any Case failed, otherwise unknown if any is unknown, otherwise passed (`testing/F27`). A Case recorded as `skipped` or left out is `unknown` in the result, and never counts as passed.
- **Verification and validation stay apart.** Three Cases are deterministic and are re-run by anyone from the recorded inputs: `record-valid` (run `check-record` on the record), `cited-version` (the recorded hashes match the commit) and the effect diff behind `effects-declared`. The rest are the checker's judgment, recorded as judgment with the reason. `validates-intent` is judged against the Owner's blind judgment of the Intent, not by whether the record validated or no write occurred, and not by how many defects Review found.
- **Absence of writes is not a pass.** `effects-declared` and `writes-authorized` pass only when each observed effect is a declared one and each write has the target's authorization.
- **Nothing is certified.** A failed Case returns to Review as a Finding. A Finding the checker confirms becomes a Defect in Review's context, in the shape of the Defect record (#991), with a RED Case in Review's own Defect Plan (`review/E7`). An unconfirmed Finding is answered with reasoning. The result is input to the Owner's decision and never a gate.

## Rubric for `validates-intent`

Review validates: it judges whether the change serves its Intent. The checker classifies Review's judgment against the Owner's blind judgment (the key) before judging the Case. Testing fixes the classes and what is recorded; the pass bar stays an Owner choice (see below).

| Class | Meaning | Evidence the checker records |
| --- | --- | --- |
| Matches | Review's verdict equals the key, and every reason ties the change's behavior to the Intent. | The verdict, the key, and the Intent clause each reason cites. |
| Right for the wrong reason | The verdict equals the key, but the reasons rest on tests, style or defects rather than on the Intent. | The verdict and the reason that does not trace to the Intent. |
| Near miss | The verdict is one step from the key ("serves in part" against "serves" or "does not serve"). | The verdict, the key, and what the difference is. |
| Differs | The verdict is the opposite of the key ("serves" against "does not serve"). | The verdict, the key, and the reason Review gave. |
| Cannot judge | Review declares it could not judge and says what it lacked. | The stated gap. |
| False certainty | Review claims the Intent is served, or not served, about something it did not examine. | The claim and what was not examined. |
| Verification drift | The record reports defects or test results as the substance of the verdict. | The item. It is returned to Testing or the owning capability as input and is never scored as validation. |

Pass, fail and undecided for the Case:
- **passed** only when the precommitted option's line is met: `Matches` on the real Intent, no false certainty, and, under option A, the control judged `does not serve`.
- **failed** when the real-Intent verdict is `Differs` or `Near miss`, any false certainty exists, or, under option A, the control is not judged `does not serve`. A `Right for the wrong reason` verdict is not `Matches`, so it does not pass.
- **skipped** when Review declares `Cannot judge`, or the checker cannot decide the class, unless another part already decides it as failed.

Defects Review happens to find are recorded as Verification drift and returned as Findings for Testing and the owning capability. They are not credit and not penalty for this Case. Counts of each class are recorded in `review/T20/intent-and-key`. Testing records them and does not choose the bar.

### Acceptance bar options (Owner chooses and precommits before the trial)

The bar, the Intent, the key and the repository and change are written into the Run's Test Data before the Agent starts, and are not changed after Review's first record is seen. Testing offers these options and chooses none.

| Option | Reviews | Pass line for `validates-intent` | False certainty |
| --- | --- | --- | --- |
| A. With a control (proposed) | 2 sessions: the real Intent and a mismatched-Intent control | `Matches` on the real Intent, and the control judged `does not serve` | any fails the Case |
| B. Real Intent only | 1 session | `Matches` on the real Intent | any fails the Case |
| C. Record only | 1 session | no line; the class and reasons are recorded and judged by the CPO | recorded; the CPO decides |

Each review runs in its own fresh performer session, so the control never primes the real run. Under A and B the Case is `failed` when the line is missed, and each miss returns to Review as a Finding. Under C only `validates-intent` is recorded `skipped` with the class, so it never reads as passed; every other Case keeps its observed outcome.

The compact decision comparison for the Owner, with the definitions, consequences and target safety, is in `decision-comparison.md`. Neither option is accepted by default.

### Selecting the repository and task

Decided by the Owner (5 Nov): the target kind is **a real pending change in one of the Owner's own non-KAAL repositories**, in a throwaway copy of the branch, **through the CPO**. The CPO selects the repository and change, obtains the Owner's written authorization for the copy, and reviews the checker's verdict. The Owner is not the judge. The author of Review and Testing take no part in the selection. The selection, who made it and when are recorded in `review/T20/consumer-repository` and `review/T20/task` before the Agent runs. The repository and change are not chosen yet, and nothing runs until the Owner separately authorizes the start. A merged public pull request and a synthetic repository are not used.

### Checker calibration

Before the trial the checker is calibrated, and the record shows it:
1. The Intent and the Owner's blind judgment are written down before the Agent runs, and kept with the Run (the key).
2. The checker classifies a small known set first, such as pre-written judgments with a known Matches, Right for the wrong reason, Near miss, Differs and Verification drift item, and the result is compared to the key. Disagreements are written down with the reason.
3. For a second pass, a second independent checker classifies the same record without seeing the first classification; agreement per item is recorded, and every disagreement is resolved in writing or left as `skipped` for that item.
4. The checker's identity (a fresh Claude session: its model and the context it was given), its relation to the author of Review, and any KAAL exposure beyond the text under test go into `review/T20/checker`. The CPO reviews the checker's verdict and the review is recorded beside the Run; it does not replace the checker's classification.

A calibration that fails (the checker misclassifies the known set) means the Case `checker-independent` is not passed, and the trial does not count.

## Open points

These are explicit Owner choices. Testing does not choose them silently, and the Plan does not start the trial.

- Decided by the Owner (3 Nov): the independent checker is a fresh Claude session with no KAAL context, and Kai or the CPO reviews its verdict. The performing Agent and the checker are separate sessions: the checker is not told how the Agent was prompted beyond the recorded task and does not share its context. The verdict review is recorded in the trial record, and the Run is kept in the consumer context (`testing/F33`). Decided (5 Nov): the target is a real pending change in an Owner non-KAAL repository, selected and authorized through the CPO, who also reviews the verdict. Still open: the repository and change themselves.
- The acceptance bar for `validates-intent` (A with a control, B real Intent only, or C record only). Testing records the classes and does not choose the bar.
- The repository, the change and its Intent, and the size of the calibration set.
- Whether Product's Decision Preparation cites the Run by commit (the Run itself is kept in the consumer context).
- Whether a Review change after the trial, such as a fix for a Finding, needs a full new Run or only the affected Cases. The model reads a Run of another version as showing nothing, so it needs at least those Cases.

No promotion or publication is authorized.
