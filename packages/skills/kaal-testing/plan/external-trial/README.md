# Review External trial (review/T20): Testing's evidence plan

This is a PLAN Change for Testing. It ships no code, export, package or promotion. It answers Review's T20 (review PLAN #984, DO #1012 merged) and Product's External bar (#978 section 6): how the independent trial of Review is run and recorded as evidence. It does not run the trial, and it does not claim Review is External-ready. Testing records what is observed; the Owner decides readiness.

## What is under test

The text of `kaal/review` at a named commit, as an outside consumer receives it: `skills/kaal-review/SKILL.md`, its `references/` (including `standalone.md`) and the two optional scripts. At this writing the head is `abdb905065052ec04cfc3c9eb3ecc20f46e9320b` (after #1012). The trial names the commit it used; if `kaal/review` moves, the earlier trial shows nothing about the new text and a new Run is needed (`testing/F31`).

## Who does what

| Part | Owner |
| --- | --- |
| The claims under test (`review/E6`) and the Skill text | Review |
| The bar: unrelated repository, plain text at a version, real task, independent checker, effects checked (#978 section 6) | Product |
| The judgment: a real task done by a cold Agent, checked by someone who is not the author | an independent checker (validation, reasoned judgment) |
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

## Open points

- Who is the checker and who chooses the repository (Product, with the Owner), and whether the cold Agent is a session or a person.
- The line for `useful-and-correct`, such as how many of the seeded defects must be found. Testing records counts and does not set the line; Product and the Owner do.
- Where the consumer keeps the Run, and whether Product's Decision Preparation cites it by commit.
- Whether a Review change after the trial, such as a fix for a Finding, needs a full new Run or only the affected Cases. The model reads a Run of another version as showing nothing, so it needs at least those Cases.

No promotion or publication is authorized.
