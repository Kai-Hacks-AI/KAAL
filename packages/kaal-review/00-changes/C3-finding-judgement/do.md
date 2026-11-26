# review/C3 DO

Authorized by the CPO's approval of the PLAN at d0b27c9 (#2112), and by the Owner's rule that a merged PLAN is the go for its DO. The approval authorizes no decision on who owns the end-to-end flow, and this DO makes none.

## Delivered

- `lib.mjs` defines the focus `finding` for Review, with a reference of what the work under review declared it would do and an actual of what the finding says is wrong. It is a one-line change, so Review knows no subject and the change stays small. A record with this focus is read like any other, and T293 and T294 read its chapters Verdict and Handover.
- One application, `applications/finding-codex-t295`: a P2 finding of `@codex review` on PR #2128, judged. The verdict is invalid, marked Judged, with the challenge, the evidence read, where it was found as the reviewer placed it, and `Closed:` with the reason. The Handover says that none applies and why. It is a real finding that was answered on its thread, and the review follows the answer.
- T293 and T294 renamed from `.red.mjs` to `.test.mjs`, now green.

## Checked

- The Cases of the package run green: 11 of 11 in `test/cases.test.mjs`, and the packaging tests of `test/review.test.mjs` 9 of 9.
- A first draft of the application failed T23: one finding stated no evidence. Corrected in the record, no Case was changed.
- The application exercises the invalid ending. The endings valid and unknown, and a finding marked Proven, are covered by T293 when an application states them; none was recorded here, and a later review of a valid finding will show them.

## Not done

No promotion and no publication. Nothing in the Skill, the Nodes or any other package changed, and the Skill does not mention the focus. No decision on the flow owner. The collector of review/C4 also changes `lib.mjs`, in other lines; whichever collector is promoted second merges the other first.
