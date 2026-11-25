# Review: a Codex finding on T295, judged before anything acts on it

## Focus

finding: one finding raised against a piece of work is judged, and where it was found is kept as given. The finding is a P2 of `@codex review` on PR #2128, the PLAN of review/C4 (a retrospective review of a finding already answered on its thread).

## Reference

PR #2128, the PLAN of review/C4: F26 and T295 at 41f680c. F26 says a `subject` is one non-empty id without whitespace and that a well-formed id is accepted. T295 is a Case of F26 that checks the id of every application that names an element.

## Actual

the Codex finding on PR #2128, comment 4641091076, on T295.red.mjs line 14. It says the assertion `/^\\S+$/` matches a literal backslash followed by `S`, so a valid subject such as `controls/C18` would be rejected and T295 could never turn green, and it asks for `/^\S+$/`.

## Comparison

Marks. Proven: a Case shows it, cited by id with its result. Judged: only judgement can settle it, and the reasoning is given. Testable, not tested: a test could show it and none exists, and the finding says what a test would have to show.

### Promised, not delivered

- Proven. F26 promises that a well-formed id such as `controls/C18` is accepted. T297 accepts `controls/C18` and `release/CTL1` through the same check, and ran green in the Engineering check of #2131 at d52b7e1. Checked: T297, and the check run of d52b7e1.
- Testable, not tested. T295 at 41f680c was RED, because no application named an element yet, so no run of it at that head could show the assertion accepting an id. A test would have to run T295 at 41f680c over an application whose subject is a well-formed id; that came with the DO and not with the PLAN. Inferred: from T295 at 41f680c and the files of #2128.

### Delivered, not promised

- Judged. The finding delivers a fix, `/^\S+$/`, that is what T295.red.mjs line 14 already holds. What it asks to change is how the line is displayed in its text, not the file. Checked: T295.red.mjs line 14 at 41f680c.

## Verdict

- Judgement: invalid.
- Mark: Judged.
- Challenge: the finding was put to the file it names. Does line 14 hold a doubled backslash, and would `controls/C18` be refused?
- Found at: packages/kaal-review/02-requirements/F26-validates-an-element/T295.red.mjs:14 (PR #2128, comment 4641091076), as the reviewer placed it.
- Checked: line 14 at 41f680c holds one backslash. The author ran the expression when answering the thread, and it accepts `controls/C18` and refuses `a b`. T297 accepts well-formed ids.
- Closed: the claimed doubled backslash is not in the file, so there is nothing to fix; the doubled backslash is how the finding's text shows the code. The thread was answered with this reason.

## Handover

None applies. An invalid finding hands nothing over: it is closed with its reason in the Verdict. Had it been valid and deterministic it would have been handed over to prove, to record and to place, each when the failing element was shown to exist; here the claimed failure is not in the file.

## Evidence

Inspected: the finding on PR #2128, comment 4641091076; T295.red.mjs line 14 at 41f680c; T297.test.mjs; the Engineering check of #2131 at d52b7e1.

- **Is the claimed doubled backslash in the file?** No. Line 14 holds a single backslash.
- **Does a well-formed id pass?** Yes. T297 accepts them, and the Engineering check of #2131 at d52b7e1 succeeded.

No trial is run by this review, and none applies.

## Not checked

- Whether the reviewer has a better reading of the line than the file's text, such as a rendering it could not see.
- Other regular expressions of the Cases of this package.
- Whether the finding would have been raised against the same line at a later head.

## Limits

The reviewer is an Agent, and its judgement is not proof. It reads the file and recorded checks and runs no test of its own; the run of the expression was the author's and is only reported. It reviews after the fact, with the outcome known. No human has judged this review.

## For the Owner

1. Recording an invalid finding: option one, answer on the thread with the reason, as was done; option two, keep a review like this one for each finding judged invalid.
2. Findings that quote code with escapes: option one, read the file and ignore the quoted form; option two, ask the reviewer to quote code in a fenced block so that its escapes are not altered.
3. What a human should observe for themselves: that line 14 of the Case holds one backslash.

## No authority

This review grants no authority. It approves, merges and decides nothing, it changed nothing of the reviewed work, and no change is asked of it for the sake of this review.
