# Review External trial (review/T20): Testing's evidence plan

This is a PLAN Change for Testing. It ships no code, export, package or promotion. It answers Review's T20 (review PLAN #984, DO #1012 merged) and Product's External bar (#978 section 6): how the independent trial of Review is run and recorded as evidence. It does not run the trial, and it does not claim Review is External-ready. Testing records what is observed; the Owner decides readiness.

## The question (Owner, 5 Nov)

Compare, on the same task:

1. a **bare agent**, as the provider ships it;
2. the agent with **Agent instructions** only;
3. the agent with **kaal-review as a Skill**, including its deterministic scripts.

If kaal-review improves the result over both, Review has passed validation. The three levels are the rungs of the BASS escalation ladder (bare agent, Agent instructions, Skill, Script). The trial therefore asks what each rung adds. It does not ask whether Review is "correct": judgment is semantics, and "correct" is a bar nobody can manage. It asks whether Review makes the result better.

## What is under test

The text of `kaal/review` at a named commit, as an outside consumer receives it: `skills/kaal-review/SKILL.md`, its `references/` (including `standalone.md`) and the two optional scripts (arm 3). At this writing the head is `abdb905065052ec04cfc3c9eb3ecc20f46e9320b` (after #1012). The trial names the commit it used; if `kaal/review` moves, the earlier trial shows nothing about the new text and a new Run is needed (`testing/F31`).

The three arms differ only in what the agent is given beyond the task:

| Arm | Given | Not given |
| --- | --- | --- |
| 1 Bare agent | the task, the change, the Intent | any instructions, Skill or script |
| 2 Agent instructions | the same, plus the Agent-level instructions of Review (the shipped `AGENTS.md` layer, as text) | the Skill, its references and scripts |
| 3 Skill | the same as arm 2, plus the Skill, its references and its deterministic scripts | no other KAAL text, no Engine, installation or registration |

The exact text of each arm's input is hashed and recorded before the arms run.

## Scope of this trial

CPO review (5 Nov): the External product model is wider than this trial. A KAAL-primed Agent may use Review as the work, and other capabilities (for example Architecture) as lenses on an unrelated target, with writes when the target's owner authorizes and the capability declares them. A standalone, read-only review is one case of that model. This plan measures one narrow thing: whether Review's own text, at the Skill level, improves the Owner's validation of a real change (does the change serve the Intent its Owner gave it, with its effects declared and any writes authorized) over a bare agent and over Agent instructions alone. It does not test lenses, composition or other capabilities, and what it shows says nothing about them (`testing/F31`). Review is validation and Testing is verification (Owner, 5 Nov): finding real defects is verification and is not scored here. A later trial that adds a lens or an authorized write is a separate Plan and a separate Run.

## Who does what

| Part | Owner |
| --- | --- |
| The claims under test (`review/E6`) and the Skill and Agent text | Review |
| The bar: unrelated repository, plain text at a version, real task, independent checker, effects checked (#978 section 6) | Product |
| The change and Intent: a real pending change in an Owner non-KAAL repository, through the CPO | the CPO, for the Owner |
| The three runs: each a fresh Claude session given only its arm's input and the task | the performing Agents (sessions A1, A2, A3), one per arm |
| Experiencing the three arms' output, and the judgment of "improves" | the Owner (Kai, 5 Nov: the CPO and CTO observe, they do not judge); the basis is open question 2 |
| The checklist and the facts: applying the checklist to each record, and running the neutral script | the checker, a fresh Claude session with no KAAL context (Owner, 3 Nov); never a performing Agent, never the Testing thread. Its readings are its own judgment |
| Observing and steering | the CPO and the CTO: they observe the experiment and steer it, and steer the Owner toward results. They are observers and steerers, not judges. Each steer (who, when, what) is recorded in `review/T20/observers`. A view of theirs on which record is better is recorded as theirs, beside the Owner's, and never replaces it |
| The Plan and the Run as evidence: Cases, three results, provenance, Test Data | Testing (this PLAN) |
| Calling Review External-ready | the Owner |

Testing is not the judge and not a performing Agent, and does not choose the repository, the change or the Intent.

## The Plan

`trial-plan.json` is an ordinary Plan of Testing's own model, with nothing new: Plan `review/T20` (version 4), five Suites (independence, arms, claims, effects, pin) and sixteen Cases. `check` over it gives no findings, and a dry Run over it behaves as the model says (all passed, one skipped gives unknown, one failed gives failed). The Plan holds seven Test Data items (subject commit, consumer repository, judge, task, arm inputs, comparison, observers), recorded as the Run's effective Test Data (`testing/F31`, `F32`).

## Running it

1. **Choose and state the Intent.** The CPO, for the Owner, chooses an unrelated repository and a real pending change in it, and the Owner states in writing the Intent the change is for, with what would show it is served. The Intent, the checklist, the way "improves" is decided and the three arm inputs (with hashes) are recorded before any arm runs. Choosing is Product's or the Owner's, not Testing's.
2. **One snapshot, one task.** The target is a throwaway copy of the pending branch, captured by tree and refs. All three arms get a fresh copy of the same snapshot and the same task text. The only difference is the arm's input. No arm sees another arm's output.
3. **Authorize.** The target's owner states in writing what writes any Agent may make (by default none outside the copy).
4. **Run the three arms.** Each in its own fresh session. The target is captured again after each. An order that could favour an arm is randomized and recorded.
5. **Hide the arm.** The records are given to the checker and the Owner as three anonymous records in random order. Neither knows which arm made which (the open question 3 asks whether the Owner sees them so).
6. **Experience and judge.** The checker records, per record, the checklist below, each reading as its own judgment with its reason. The Owner experiences the three outputs and records which is more useful and whether arm 3 is better than both, as the Owner's judgment with its reason. The CPO and the CTO observe and steer; they record their steers and any view as theirs. Facts are recorded by script (see Evidence rules). One outcome per Case is recorded in the model's own outcomes, `passed` or `failed`, attributed to who decided it. A Case nobody can decide is `skipped` or left out of `outcomes`, never a literal `unknown`: `unknown` is derived by the model (`testing/F26`).
7. **Record.** One Run of `review/T20`, with provenance naming the Plan, its Suites and the Cases at their versions, and the Test Data as recorded. The consumer keeps the Run; Testing keeps none (`testing/F33`).

## Evidence rules

- **Three results, unknown never passed.** The trial's result is the model's: failed if any Case failed, otherwise unknown if any is unknown, otherwise passed (`testing/F27`). A Case recorded as `skipped` or left out is `unknown` and never counts as passed.
- **Truth is only deterministic.** Owner's principle (5 Nov): truth rests on hard deterministic facts, and an argument that is not deterministic is not truth. A **fact** is something anyone can re-derive from recorded inputs by a script or a test. Everything else is a **judgment**, recorded as judgment with its reason and who made it, and never worded as truth. Every arm's record, the judge's and the CPO's assessments are judgments. "Improves" is a judgment: a pass means "judged better by this person on this basis", not "true".
- **kaal-review judges, kaal-testing proves (Owner, 5 Nov).** The step from validation to verification lies between Skill and Script on the BASS ladder. Review's record is produced on the Skill side. It is judgment, worded as judgment, and claims no proof. Nothing in this plan states or implies that Review proves anything, and no Case treats a record as proof. Proof is only on the Script side: what a script or test re-derives from recorded inputs, and the model's own derivation of the three results. Testing proves only those.
- **The same facts for every arm.** The deterministic checks are applied by the same neutral script to all three records, so no arm is measured by its own tools. They are: every `path:line` pointer in the record resolves in the snapshot; the Intent text is quoted unchanged; the effect diff of the copy against the declared effects; and the arm input hashes match the recorded ones. For arm 3 the Skill's own `check-record` is a further fact, recorded as that arm's, and it is not used to compare arms.
- **Absence of writes is not a pass.** `effects-declared` and `writes-authorized` pass only when each observed effect is a declared one and each write has the target's authorization, in every arm.
- **Nothing is certified.** A failed Case returns to Review as a Finding. A Finding the CPO confirms becomes a Defect in Review's context, in the shape of the Defect record (#991), with a RED Case in Review's own Defect Plan (`review/E7`). An unconfirmed Finding is answered with reasoning. The result is input to the Owner's decision and never a gate.
- **Small sample.** One change and one run per arm show what three agents produced on one change at one commit. The result is a screen, not a rate.

## Checklist and rating

Review validates: it helps decide whether the change serves its Intent. "Useful" can be managed where "correct" cannot. The checker applies a four-item checklist to each record. Each item has a **deterministic part** (a fact a script re-derives) and a **judged part** (judgment).

| Item | Met when | Deterministic part | Judged part |
| --- | --- | --- | --- |
| U1 Intent restated | The record restates the Intent and what would show it served, and the Owner recognizes it. | The Intent text is quoted unchanged. | The Owner recognizes the restatement. |
| U2 Traced to the change | For each Intent clause, the record points at where the change bears on it. | Every pointer resolves to a real path and line. | That the pointers bear on the clause. |
| U3 What to observe | The record leaves the person what to look at or decide next. | none for free text; arm 3 also by `check-record`. | That the items help. |
| U4 Limits stated | The record says what it did not examine, and claims nothing of "served", "not served" or "complete" about anything it did not examine. | none for free text; arm 3 also by `check-record`. | That no claim covers what was not examined (false certainty). |

The Owner rates each record, and may use the checker's readings, **useful**, **partly useful** or **not useful** for deciding whether the change serves its Intent, with a reason. Defects a record happens to find are recorded as input for Testing and the owning capability. They are neither credit nor penalty.

## What "improves" means

Decided by the Owner: Review passes validation if the Skill-based run improves the result over the other two, and the Owner experiences and judges the output; the CPO and CTO observe and steer (5 Nov). Testing records, and the Owner decides the rest (open questions 2 and 3):

- The comparison is of arm 3 against arm 1 and against arm 2, each separately.
- **improves** is recorded only when the Owner rates arm 3's record more useful than the arm's record, on the stated basis, with the reason; the facts above are recorded beside it and do not decide it alone.
- `improves-over-bare` and `improves-over-instructions` are separate Cases, so a pass over one and not the other is visible. Review passes validation only when both pass.
- A tie, or an arm 3 that is worse, is `failed` for that Case and returns to Review as a Finding. If the Owner does not decide, the Case stays `skipped`, which reads as `unknown`.

## Selecting the repository and task

Decided by the Owner (5 Nov): the target is **a real pending change in one of the Owner's own non-KAAL repositories**, in a throwaway copy, **through the CPO**. The CPO selects the repository and change, obtains the Owner's written authorization for the copy, and reviews the judge's verdict. The author of Review and Testing take no part in the selection. The selection, who made it and when are recorded in `review/T20/consumer-repository` and `review/T20/task` before any arm runs. Nothing runs until the Owner separately authorizes the start.

## Checker calibration

Before the trial the checker is calibrated, and the record shows it:
1. The Intent, the checklist, the basis of "improves" and the arm inputs are written down before the arms run, and kept with the Run.
2. The checker applies the checklist to a small known set first, such as pre-written records with a known item met, an item not met, a false certainty and a known better record, and the result is compared with the expected one. Disagreements are written down with the reason.
3. The checker's identity (a fresh Claude session: model and context given), its relation to the author of Review, and any KAAL exposure beyond the text under test go into `review/T20/judge`.

A calibration that fails means `judge-independent` is not passed, and the trial does not count.

## Open Owner questions

Testing does not choose these silently, and the Plan does not start the trial. They go to the Owner one at a time.

1. *Who judges "improves": decided (5 Nov).* The Owner experiences and judges. The CPO and CTO observe and steer the experiment and the Owner toward results; they are not judges.
2. **On what the Owner judges.** A: usefulness for validating the change against its Intent (the checklist and the rating above). B: only which record the Owner would rather have, with a reason.
3. **What the Owner sees.** A: the three records anonymous and in random order, then the arms revealed. B: the records labelled by arm from the start.
4. **How many runs per arm.** A: one run per arm. B: three per arm, with "improves" meaning arm 3 is ahead in most.
5. The repository, the change and its Intent, and the size of the calibration set. (Decided: through the CPO.)
6. When the trial may start. Not before the Owner says so.

Whether a Review change after the trial needs a full new Run or only the affected Cases is Testing's to say: at least those Cases, since the model reads a Run of another version as showing nothing.

No promotion or publication is authorized.
