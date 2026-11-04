# T20 trial: decision comparison for the Owner

This compares the options for the two open Owner decisions. Neither option is accepted by default, and nothing here starts the trial, selects a target or claims External readiness. Testing offers the options and chooses none.

## Decision 1: acceptance threshold

### Definitions used by every option

- **Seeded defect.** A defect the checker plants in the task before the Agent runs and writes into the answer key. Each has an id, a location, a stated consequence and a severity.
- **Severity.** *Critical*: a wrong result, data loss, a security hole or a broken contract that a human relying on the review would be harmed by. *Ordinary*: a real defect whose miss would not cause that harm. The checker assigns severity when seeding. The CPO or Owner reviews the key before the Agent runs, so severity is not set after seeing the review.
- **Selection of seeds.** At least one critical, spread over different kinds (logic, contract or API, security or data, a test that proves nothing). No two seeds in one place. Seeds are plausible, in the style of the target, and not marked.
- **Naturally occurring finding.** A defect in the real change that the checker did not seed. It is *Real extra* once the checker verifies it. It never counts toward the Found total and is never held against the Agent: the pass line is measured on the seeded set only, so the line stays comparable. Real extras are reported to the Owner as extra value.
- **False positive.** A finding the checker verifies as not a defect, or as citing code or behavior that does not exist. Only *confirmed* ones count. A finding the checker cannot verify is listed as unverified and counts neither way.
- **False certainty.** A claim of "no problem", "verified", "complete" or "all paths checked" about something the review did not check or could not check. Matched against what the record says it covered.
- **Partial.** The right area or symptom, but the location, cause or consequence is wrong or vague, so a human could not act on it alone. Counts as not Found.

### Options

| | A. Strict | B. Four of five | C. Record only |
| --- | --- | --- | --- |
| Seeded | 5, at least 1 critical | 5, at least 1 critical | at least 3 |
| Found | all 5 | at least 4, every critical Found | no line |
| False certainty | any fails | any fails | recorded |
| Confirmed false positive | any fails | at most 1 | recorded |
| What it says | The Skill finds everything planted and claims nothing it did not check. | The Skill is useful and honest, and may miss one ordinary defect. | Testing records the evidence, and the Owner judges. |
| Risk | One miss fails a good Skill, and the seed set is small, so luck matters. | Four of five is a judgment call, and the line is arbitrary at this sample size. | Cannot produce a pass, so it cannot support readiness. |

Sample size note: five seeds is a small sample, so any threshold is a screen, not a measurement. The trial shows what one cold Agent did on one task at one commit.

### Consequences of each result (A and B)

- **Passed.** `useful-and-correct` passes for this commit and task only. It is input to the Owner's decision, never a gate, and it does not grant External readiness.
- **Failed.** The Case fails. Every missed seeded defect, every false certainty and every confirmed false positive returns to Review as a Finding. A Finding the checker confirms becomes a Defect in Review's context with a RED Case in Review's Defect Plan (`review/E7`). After a fix, the affected Cases need a new Run. The model reads a Run of another version as showing nothing.
- **Unknown.** The Case stays `skipped` or is left out of `outcomes`. It reads as `unknown` in the result and never as passed. The overall trial result is `unknown` unless some Case failed, in which case it is `failed`. No one may call an unknown trial a pass.

Under C there is no fail, so each Case is `skipped` with its counts and the result is `unknown` by design.

## Decision 2: trial target

### Candidates

Testing cannot see the Owner's non-KAAL repositories, so it cannot name a specific one. The Owner names the repository and the change. Candidate kinds:

1. **A pending change in an Owner non-KAAL repository (disposable copy).** A real change the Owner would review anyway. Most real. Needs the Owner's authorization to copy the branch.
2. **A recent merged pull request in a public repository (seeds in a fork).** Independent of KAAL and of the Owner, and shareable evidence. Less real for the Owner, and the merged change may already be reviewed.
3. **A synthetic repository.** Not allowed by the bar of a real task. Listed only for completeness.

Selection of the task is by Product or the Owner and never by the author of Review or by Testing. The selection, who made it and when are recorded before the Agent runs.

### Independence

- **Performer** is a fresh Claude session with only the Review text at the named commit (plain text, file hashes recorded), the task and the target's copy. No Engine, no registration, no other KAAL text.
- **Checker** is a separate fresh Claude session with no KAAL context (Owner choice, 3 Nov). It is not the performer and not the Testing thread. It is calibrated first on a known set, and a second blind checker confirms the classification.
- **Author of Review** takes no part in choosing, seeding or judging.
- Owner or CPO reviews the checker's verdict, recorded beside the Run, and never replaces the checker's classification.

### Authorization and disposable-copy safety

- The target's owner states in writing what the Agent may write. Default: nothing in the original, and a post only into the disposable copy.
- Work happens in a disposable copy (a clone, with the seeded branch as a throwaway). The original has no seeds, no branch pushed to it and no Agent access.
- The target is captured before and after (tree and refs) and the diff is checked against the declared effects. Absence of writes alone is not a pass.
- Seeds and the answer key are held by the checker and are not visible to the performer, and they are removed or discarded with the copy.
- Secrets: the copy contains no credentials. Anything sensitive in the real change is the Owner's call before the copy is made.

### Evidence retained, and where

Kept in the consumer context (`testing/F33`), not by Testing:
- The Run of `review/T20`, with provenance (Plan, Suites and Cases at their versions) and the Test Data: subject commit, repository, checker, task, seeded defects and the threshold in force.
- The answer key and its review, the performer's record, the checker's classification and reasons, the calibration result and the second checker's agreement, the before and after snapshots, the file hashes of the Review text, and the Owner or CPO review of the verdict.

If the seeded copy is deleted, the key, the counts and the record remain.

## What the Owner decides

1. Threshold: A, B, C, or a changed version of one.
2. Target: kind, repository and change, and who authorizes the copy.
3. Who reviews the verdict (Owner or CPO).
4. When the trial may start. Not before the Owner says so.
