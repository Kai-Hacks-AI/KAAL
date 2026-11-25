# Review: release/CTL1, what the control declares it reveals against what it does

## Focus

control: what a control declares it reveals is compared with what it does. The application is release/CTL1, verify Stages, a detective control of the release capability, read at main 3741577. It exercises the field `subject` of review/F26: the element it validates is named by its own id.

## Reference

release/CTL1 and its Intent release/I27 at 3741577: release/CTL1 declares in CTL1.md that `Engineering / verify Stages (<Ruleset>)` judges the sources of the delivery stages against the stages declaration and fails when a stage differs, and that it blocks nothing by itself. Its Intent, release/I27, says: "When a stage differs from its declaration, a person or an Agent is told which stage and how, before a change relies on it." The reference is provided by the control and its Intent, as Review defines no focus for a control.

## Actual

Read: the stages judge and the Cases that name it or its Change at 3741577. The judge `judge.mjs` takes the declaration, the ruleset sources and the control declarations, and returns pass or fail with a list of findings, each naming the check and a message; unreadable input fails closed. The Cases that read it are T483 (the judge passes the agreed structure and fails every departure and every unreadable input), T486 (a wire head is admitted only when the two verify Stages checks are green) and T540 (the finder lists release/CTL1 equal to its draft).

## Comparison

Marks. Proven: a Case or recorded check shows it, cited by id with its result. Judged: only judgement can settle it, and the reasoning is given. Testable, not tested: a test could show it and none exists, and the finding says what a test would have to show.

### Promised, not delivered

- Proven. The control reveals a differing stage, which I27 asks for: T483 judges a missing ruleset, a wrong target, an extra rule, an extra context and an unreadable input as failing, and the Engineering check on the reviewed pull requests of this repository, which runs it, reports success. Checked: T483 in `C35-stages`, and the Engineering check run of #2112 at d0b27c9. The Case belongs to the Change C35 and not to the control by id.
- Judged. I27 says a person or an Agent is told which stage and how. Each finding of the judge carries the name of the failing check, which is `verify Stages (<Ruleset>)` and so names the stage, and a message that states how it differs, so the claim reads as met. Checked: `judge.mjs`, the `add` helper and its messages. Whether a person finds a message clear enough to act on is a reading.
- Testable, not tested. I27 says the telling comes before a change relies on it. CTL1.md says the control blocks nothing by itself and that a ruleset requiring it is another control. So the control delivers the telling, and the before is delivered by a different control. Checked: CTL1.md and T486. A test would have to show, on a pull request whose stages differ, that the check fails before the merge and that the merge is refused.

### Delivered, not promised

- Judged. T540 is the only Case that names release/CTL1 by id. It checks that the finder lists the control equal to its draft, which is the registration of the control and not what it reveals. A reader who takes the Case as proof of the control would be misled. Checked: `T540.test.mjs`. That the control's own `evidence` line asks for a provoked failure is stated in CTL1.md and was not read as shown.
- Judged. The judge also fails when a status-check rule is traced to a control that has no Intent, which CTL1.md does not mention. It reads as a reasonable guard that goes beyond the declaration, and no Case was read for it. Checked: `judge.mjs`, the `traced` helper only.

## Evidence

Inspected: engineering/release-management/04-controls/CTL1-verify-stages/CTL1.md; engineering/release-management/01-intent/I27-stages-intact/I27.md; engineering/release-management/05-src/stages/judge.mjs; engineering/release-management/04-controls/CTL1-verify-stages/T540.test.mjs; engineering/release-management/00-changes/C35-stages/T483.test.mjs and T486.test.mjs.

- **Does the control tell which stage differs and how?** It reads as yes: each finding names the failing check, which names the stage, and a message that says how it differs. The wording of the messages was not judged for a human reader.
- **Is the control itself shown to reveal a differing stage?** Only through the Change that built it. T483 shows the judge fails every departure it lists, and T540 does not. No Case names release/CTL1 and provokes a differing stage, so what the control reveals is not shown by the control's own Case.

No trial is run by this review, and none applies.

## Not checked

- Whether the Engineering check is a required check of any ruleset, which is the other control's business.
- The rest of `judge.mjs`, beyond the findings and the traced helper.
- The control's `evidence` line against runs on real pull requests.
- Whether T483 covers every departure of the declaration, beyond its title.

## Limits

The reviewer is an Agent, and its judgement is not proof. It reads files and recorded checks, runs no test, and reads after the fact. The reference is the control's own words and its Intent, so a review cannot say whether the Intent is the right one. No human has judged this review.

## For the Owner

1. A Case for the control: option one, leave the reveal to the Cases of C35 as now; option two, add a Case that names release/CTL1 and provokes a differing stage, so that the finding about the control's own proof is shown.
2. The before in I27: option one, accept that another control delivers it; option two, state in CTL1.md which control delivers it, so a reader of I27 can follow it.
3. What a human should observe for themselves: that the messages of the judge are enough to act on for someone who has not read its source.

## No authority

This review grants no authority. It approves, merges and decides nothing, and it changed nothing of the reviewed control or its Cases; no change is asked of them for the sake of this review.
