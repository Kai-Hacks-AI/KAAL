# Review External trial (review/T20): Testing's evidence plan

This is a PLAN Change for Testing. It ships no code, export, package or promotion. It answers Review's T20 (review PLAN #984, DO #1012 merged) and Product's External bar (#978 section 6): how the independent trial of Review is run and recorded as evidence. It does not run the trial, and it does not claim Review is External-ready. Testing records what is observed; the Owner decides readiness.

## What is under test

The text of `kaal/review` at a named commit, as an outside consumer receives it: `skills/kaal-review/SKILL.md`, its `references/` (including `standalone.md`) and the two optional scripts. At this writing the head is `abdb905065052ec04cfc3c9eb3ecc20f46e9320b` (after #1012). The trial names the commit it used; if `kaal/review` moves, the earlier trial shows nothing about the new text and a new Run is needed (`testing/F31`).

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

`trial-plan.json` is an ordinary Plan of Testing's own model, with nothing new: Plan `review/T20`, four Suites (independence, claims, effects, pin) and twelve Cases, one per decidable criterion of #978 section 6 and `review/E6`. `check` over it gives no findings, and a dry Run over it behaves as the model says (all passed, one skipped gives unknown, one failed gives failed). The Plan holds five Test Data items (subject commit, consumer repository, checker, task, seeded defects), recorded by the checker as the Run's effective Test Data (`testing/F31`, `F32`).

## Running it

1. **Choose.** Someone other than the author of Review chooses an unrelated repository and a real review task in it. At least three defects are seeded in the task, known to the checker and not to the Agent, beside whatever the review finds that was real. Choosing is Product's or the Owner's, not Testing's.
2. **Deliver plain text only.** The Agent receives a read-only copy of the Review files at the named commit, with the file hashes recorded. No Engine, installation or registration, and no other KAAL text.
3. **Authorize.** The target's owner or context states in writing what writes the Agent may make. If Review declares none for itself, the Agent may still be authorized to post the record to the target.
4. **Snapshot, run, snapshot.** The target is captured before and after (for a git repository, the tree and refs). The Agent does the review.
5. **Judge.** The checker records one outcome per Case in the model's own outcomes, `passed` or `failed`, each with a reason. A Case the checker cannot decide, skipped or unobserved, is recorded as `skipped` or left out of `outcomes`, never as a literal `unknown`: `unknown` is a result the model derives (`testing/F26`), not an outcome it accepts, and recording it would add a finding that turns a failed evaluation into unknown. The reason for every Case, including the undecided ones, is kept in the trial record beside the Run. The checker records the seeded-defect table (found, missed, false certainty) in the Test Data.
6. **Record.** One Run of `review/T20`, with provenance naming the Plan, its Suites and the Cases at their versions, and the Test Data as recorded. The consumer keeps the Run; Testing keeps none (`testing/F33`).

## Evidence rules

- **Three results, unknown never passed.** The trial's result is the model's: failed if any Case failed, otherwise unknown if any is unknown, otherwise passed (`testing/F27`). A Case recorded as `skipped` or left out is `unknown` in the result, and never counts as passed.
- **Verification and validation stay apart.** Three Cases are deterministic and are re-run by anyone from the recorded inputs: `record-valid` (run `check-record` on the record), `cited-version` (the recorded hashes match the commit) and the effect diff behind `effects-declared`. The rest are the checker's judgment, recorded as judgment with the reason. `useful-and-correct` is judged against the seeded-defect table, not by whether the record validated or no write occurred.
- **Absence of writes is not a pass.** `effects-declared` and `writes-authorized` pass only when each observed effect is a declared one and each write has the target's authorization.
- **Nothing is certified.** A failed Case returns to Review as a Finding. A Finding the checker confirms becomes a Defect in Review's context, in the shape of the Defect record (#991), with a RED Case in Review's own Defect Plan (`review/E7`). An unconfirmed Finding is answered with reasoning. The result is input to the Owner's decision and never a gate.

## Rubric for `useful-and-correct`

The checker classifies every item of the record and every seeded defect before judging the Case. Testing fixes the classes and what is recorded; the threshold stays an Owner choice (see open points).

| Class | Meaning | Evidence the checker records |
| --- | --- | --- |
| Found | A seeded defect is named, located and its consequence stated correctly. | The seeded defect id, the record item that names it, and the location match. |
| Partial | The record points at the defect's area or symptom, but the location, cause or consequence is wrong or vague, so a human could not act on it alone. | The record item, what is right, what is missing. |
| Missed | A seeded defect appears nowhere in the record. | The seeded defect id. |
| Real extra | A finding that is not seeded and that the checker verifies as a true defect in the target. | The finding and the checker's verification. |
| False positive | A finding the checker verifies as not a defect, or that cites code or behavior that is not there. | The finding and why it does not hold. |
| False certainty | A claim of "no problem", "verified" or "complete" about something the review did not or could not check. | The claim and what was not checked. |

Pass, partial and fail for the Case:
- **passed** only when the Owner's line is met (for example a minimum of Found of at least three seeded) and there is no false certainty, and the number of confirmed False positives is within the precommitted option's allowance (none under option A, at most one under option B). Partial items count as not Found.
- **failed** when the line is not met, the precommitted false-positive allowance is exceeded, or any false certainty exists, regardless of how many were Found.
- A finding the checker cannot verify either way is neither Real extra nor False positive: it is listed as unverified, and the Case stays `skipped` unless the other items already decide it as failed.

Counts of each class are recorded in `review/T20/seeded-defects`. Testing records the counts and the table and does not choose the line.

### Acceptance threshold options (Owner chooses and precommits before the trial)

Each seeded defect carries a severity set when it is seeded: critical (wrong result or data loss a human would be harmed by) or ordinary. The threshold, its severity weights and the repository and task are written into the Run's Test Data before the Agent starts, and are not changed after the first record is seen. Testing offers these options and chooses none.

| Option | Seeded | Pass line for `useful-and-correct` | False certainty | False positive |
| --- | --- | --- | --- | --- |
| A. Strict | 5 | all 5 Found, Partial counts as not Found | any fails the Case | any confirmed one fails the Case |
| B. Four of five (proposed) | 5, at least 1 critical | at least 4 Found, and every critical one Found | any fails the Case | at most 1 confirmed |
| C. Record only | at least 3 | no line; counts recorded and judged by the Owner or CPO | recorded; the Owner decides | recorded; the Owner decides |

Under A and B the Case is `failed` when the line is missed, and each confirmed miss returns to Review as a Finding. Under C only `useful-and-correct` is recorded `skipped` with the counts, so it never reads as passed; every other Case keeps its observed outcome, so an unrelated failure still fails the trial.

The compact decision comparison for the Owner, with the definitions, consequences and target safety, is in `decision-comparison.md`. Neither option is accepted by default.

### Selecting the repository and task

The repository and task are selected by Product or the Owner, never by the author of Review or by Testing. The selection, who made it and when are recorded in `review/T20/consumer-repository` and `review/T20/task` before the Agent runs. Options: (1) a real pending change in one of the Owner's own non-KAAL repositories, with the seeded defects in a throwaway copy of the branch; (2) a recent merged pull request of a public repository, with the seeds in a fork. A synthetic repository does not meet the bar of a real task.

### Checker calibration

Before the trial the checker is calibrated, and the record shows it:
1. The seeded defects and their expected classification are written down before the Agent runs, and kept with the Run (the answer key).
2. The checker classifies a small known set first, such as a pre-written review with known Found, Partial, Missed and False positive items, and the result is compared to the key. Disagreements are written down with the reason.
3. For a second pass, a second independent checker classifies the same record without seeing the first classification; agreement per item is recorded, and every disagreement is resolved in writing or left as `skipped` for that item.
4. The checker's identity (a fresh Claude session: its model and the context it was given), its relation to the author of Review, and any KAAL exposure beyond the text under test go into `review/T20/checker`. The Owner or CPO reviews the checker's verdict and the review is recorded beside the Run; it does not replace the checker's classification.

A calibration that fails (the checker misclassifies the known set) means the Case `checker-independent` is not passed, and the trial does not count.

## Open points

These are explicit Owner choices. Testing does not choose them silently, and the Plan does not start the trial.

- Decided by the Owner (3 Nov): the independent checker is a fresh Claude session with no KAAL context, and Kai or the CPO reviews its verdict. The performing Agent and the checker are separate sessions: the checker is not told how the Agent was prompted beyond the recorded task and does not share its context. The verdict review is recorded in the trial record, and the Run is kept in the consumer context (`testing/F33`). Still open: who chooses the repository and task (Product, with the Owner).
- The line for `useful-and-correct`: how many seeded defects must be Found, and how Partial counts. Testing proposes at least three seeded as a useful minimum and records the counts; Product and the Owner set the line.
- The target repository and task, and the size of the calibration set.
- Whether Product's Decision Preparation cites the Run by commit (the Run itself is kept in the consumer context).
- Whether a Review change after the trial, such as a fix for a Finding, needs a full new Run or only the affected Cases. The model reads a Run of another version as showing nothing, so it needs at least those Cases.

No promotion or publication is authorized.
