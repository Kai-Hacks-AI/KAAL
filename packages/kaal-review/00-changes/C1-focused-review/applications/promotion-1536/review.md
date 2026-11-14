# Review: promotion #1536, what it promised to change against what changed

## Focus

promotion: what the promotion promised to change is compared with what changed. The application is #1536, PROMOTION: Make the manual PR envelope check available, merged into main as cce35a7 (a retrospective review).

## Reference

the body of PR #1536: the Changes C12, C20 and C21 each as PLAN, DO and ACT, and its Why now. Why now: all PR templates are on main, the Owner freed the promotion seat, main has nothing the collector lacks, and wiring the check is a separate Change that needs its own go.

## Actual

the 38 changed files of PR #1536 at 7af0687, squashed into main as cce35a7: the folders of C12, C20 and C21 (change records, gap, baseline, change, act, evidence, and the Cases T163, T187 and T190), the Intent I7, the requirement F17, the architecture A33 and A40 with their Cases, and the sources `envelope.mjs`, `comments.mjs` and `templates.mjs`. Two artefacts were removed and two Cases renamed, all from the old Body name.

## Comparison

Marks. Proven: a Case or recorded trial shows it, cited by id or path with its result, and not repeated here. Judged: only judgement can settle it, and the reasoning is given. Testable, not tested: a test could show it and none exists, and the finding says what a test would have to show.

### Promised, not delivered

- Proven. C12, C20 and C21 are promised as DO, and their Cases T163, T187 and T190 are on main in `.test.mjs` form, with the Engineering and Workspaces checks of #1536 at 7af0687 reporting success. Checked: the file list of #1536, and the check runs of 7af0687.
- Judged. C12, C20 and C21 are each promised as PLAN, DO and ACT, and the file list shows for each the PLAN records (the C record, gap, baseline and change) and `act.md`. Whether each `act.md` is a real 4L retrospective is a reading, and the three read as one. C12 carries no `evidence.md` while C20 and C21 do, which the body does not promise. Checked: the file list of #1536 and the three `act.md`.
- Judged. Why now says main has nothing the collector lacks. The last commit of main before the squash (57c3401) is an ancestor of the promotion head, and the Promotion Source check of #1536 succeeded. Checked: `git merge-base --is-ancestor`, and the check runs of 7af0687. It reads as true, and it is a reading of recorded checks, not a Case of this Change.
- Testable, not tested. Why now says wiring is a separate Change. All 38 changed files sit under `engineering/release-management/`, and none is a workflow, hook or ruleset, but no Case asserts it. Checked: the file list of #1536. A test would have to show that every changed path of a promotion falls under the folders and sources of the Changes its body declares.

### Delivered, not promised

- Judged. C21 changed the delivered Case T161, which accepted a HOTFIX from any head, to follow the CPO decision, and the C21 change record names that. The body of #1536 does not. Checked: C21 `change.md`, DO step 3, and the body of #1536. A reader of the body alone would not learn that an earlier delivered Case moved.
- Judged. New executable sources `envelope.mjs`, `comments.mjs` and `templates.mjs` are delivered. The body names a manual envelope check, which implies them, and says nothing of their size. Checked: the file list of #1536. Not read line by line by this review.

### Promised and delivered

- Judged. C12 promises a check named for the envelope, and the old Body name is replaced: two artefacts removed (I7 and A33 under the old name) and two Cases renamed (T105 and T107), as C12 `gap.md` states. Checked: the file list of #1536, C12 `gap.md`.

## Evidence

Inspected: the body of #1536; the 38 changed files of #1536; change.md and act.md of C12, C20 and C21; the checks of #1536 at 7af0687.

- **Does the promotion carry more than its body promises?** Not more by path: all 38 files are under `engineering/release-management/`, and none wires anything. It carries one thing the body does not say, the changed delivered Case T161.
- **Was the Why now claim that main has nothing the collector lacks true?** It reads as true: the main commit before the squash is an ancestor of the head, and the Promotion Source check succeeded. This review did not rebuild the collector.

No trial is run by this review, and none applies.

## Not checked

- The sources `envelope.mjs`, `comments.mjs` and `templates.mjs`, line by line.
- That the Cases T163, T187 and T190 prove what their Changes claim, beyond their names and the green checks.
- Any later wiring of the check, which is outside this promotion.
- The merge queue and the squash itself.

## Limits

The reviewer is an Agent, and its judgement is not proof. It reads recorded checks and files and does not re-run them, and it reviews after the fact, with the outcome known. No human has judged this review.

## For the Owner

1. Declared paths for a promotion: option one, leave the path check to the reviewer's reading, as here; option two, have the owner of promotion rules add a Case that every changed path falls under the declared Changes, so that this finding becomes proven.
2. Amended delivered Cases: option one, leave it to the Change records, which name them; option two, ask that a promotion body say when a previously delivered Case was changed.
3. What a human should observe for themselves: that the three ACT records are real retrospectives, which only a reader can judge.

## No authority

This review grants no authority. It approves, merges and decides nothing, and the promotion it reviews had already landed. It changed nothing of the reviewed work and no change is asked of it for the sake of this review.
