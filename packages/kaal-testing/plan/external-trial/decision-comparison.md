# T20 trial: decision comparison for the Owner

This compares the options for the two open Owner decisions. Neither option is accepted by default, and nothing here starts the trial, selects a target or claims External readiness. Testing offers the options and chooses none.

## Decision 1: acceptance bar for `useful-for-validation`

Review is validation and Testing is verification (Owner, 5 Nov). Judgment is semantics, so "correct" is not a bar this trial can manage. "Useful" is. This trial asks whether Review's record helps decide whether the Owner's change serves its Intent. It does not score whether its verdict is right, and it does not score defects found: that is verification.

### Definitions used by every option

- **Intent.** What the change is for, written by the Owner before Review runs, with what would show it is served.
- **Checklist.** U1 the Intent is restated and the Owner recognizes it. U2 each Intent clause is traced to where the change bears on it. U3 the person is left what to observe or decide. U4 limits are stated, and nothing is claimed about what was not examined (false certainty fails U4).
- **CPO rating.** Useful (it made the decision easier or showed something the CPO would not have had), partly useful, or not useful, with a reason. It is the CPO's rating, since the CPO would use the record, and it says nothing about whether the verdict is correct.
- **Verification drift.** Defects or test results offered as the substance. Returned to Testing or the owning capability as input and never scored here.

### Options

| | A. Useful (proposed) | B. At least partly useful | C. Record only |
| --- | --- | --- | --- |
| Checklist U1 to U4 | all four met | all four met | recorded |
| CPO rating | useful | partly useful or better | recorded; the CPO decides |
| False certainty | fails U4 | fails U4 | recorded |
| What it says | The record helped the CPO decide and was honest about its limits. | The record met the form and helped in part. | The CPO judges the evidence. |
| Risk | The rating is one person's judgment, on one change. | A weaker line, so a pass says less. | Cannot produce a pass, so it cannot support readiness. |

Sample note: one change and one Intent is a small sample, so any bar is a screen. The trial shows what one cold Agent produced on one change at one commit.

### Consequences of each result (A and B)

- **Passed.** `useful-for-validation` passes for this commit, change and Intent only. It is input to the Owner's decision, never a gate, and does not grant External readiness.
- **Failed.** The Case fails. An unmet checklist item or a rating below the line returns to Review as a Finding. A Finding the CPO confirms becomes a Defect in Review's context with a RED Case in Review's Defect Plan (`review/E7`). After a fix, the affected Cases need a new Run.
- **Unknown.** The Case stays `skipped` or is left out of `outcomes`. It reads as `unknown` in the result and never as passed. No one may call an unknown trial a pass.

Under C only `useful-for-validation` has no pass line, so it is recorded `skipped` and reads as `unknown`. Every other Case keeps its observed outcome and failure precedence, so an unauthorized write or an invalid record still fails its own Case.

## Decision 2: trial target

**Decided by the Owner (5 Nov): candidate 1 below, through the CPO.** The other candidates are kept for the record and are not used.

### Candidates

Testing cannot see the Owner's non-KAAL repositories, so it cannot name a specific one. The Owner names the repository and the change. Candidate kinds:

1. **A pending change in an Owner non-KAAL repository (disposable copy).** A real change the Owner would review anyway. Most real. Needs the Owner's authorization to copy the branch.
2. **A recent merged pull request in a public repository (seeds in a fork).** Independent of KAAL and of the Owner, and shareable evidence. Less real for the Owner, and the merged change may already be reviewed.
3. **A synthetic repository.** Not allowed by the bar of a real task. Listed only for completeness.

Selection of the task is by Product or the Owner and never by the author of Review or by Testing. The selection, who made it and when are recorded before the Agent runs.

### Independence

- **Performer** is a fresh Claude session with only the Review text at the named commit (plain text, file hashes recorded), the task and the target's copy. No Engine, no registration, no other KAAL text.
- **Checker** is a separate fresh Claude session with no KAAL context (Owner choice, 3 Nov). It is not the performer and not the Testing thread. It is calibrated first on a known set, and a second blind checker confirms the classification.
- **Author of Review** takes no part in choosing, stating the Intent, or judging.
- Owner or CPO reviews the checker's verdict, recorded beside the Run, and never replaces the checker's classification.

### Authorization and disposable-copy safety

- The target's owner states in writing what the Agent may write. Default: nothing in the original, and a post only into the disposable copy.
- Work happens in a disposable copy (a clone of the pending branch as a throwaway). The original has no branch pushed to it and no Agent access.
- The target is captured before and after (tree and refs) and the diff is checked against the declared effects. Absence of writes alone is not a pass.
- The Intent, the checklist and the rating are held by the checker and the CPO, and the performer sees only the Intent it is asked to validate against.
- Secrets: the copy contains no credentials. Anything sensitive in the real change is the Owner's call before the copy is made.

### Evidence retained, and where

Kept in the consumer context (`testing/F33`), not by Testing:
- The Run of `review/T20`, with provenance (Plan, Suites and Cases at their versions) and the Test Data: subject commit, repository, checker, task, Intent, checklist and CPO rating, and the bar in force.
- The Intent, the checklist results and the CPO's rating, the performer's record, the checker's classification and reasons, the calibration result and the second checker's agreement, the before and after snapshots, the file hashes of the Review text, and the Owner or CPO review of the verdict.

If the copy is deleted, the checklist, the rating and the record remain.

## What the Owner decides

1. Acceptance bar: A, B, C, or a changed version of one. **Open.** (Reworked 5 Nov: validation, and useful rather than correct.)
2. Target: **decided (5 Nov)**: a real pending change in an Owner non-KAAL repository, in a disposable copy, through the CPO. The CPO selects the repository and change and obtains the Owner's written authorization for the copy. The repository and change are still to be named.
3. Who reviews the verdict: **decided**: the CPO (the Owner is not the judge).
4. When the trial may start. Not before the Owner says so.
