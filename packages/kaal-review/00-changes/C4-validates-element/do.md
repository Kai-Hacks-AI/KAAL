# review/C4 DO

Authorized by the CPO's approval of the PLAN (#2128), and by the Owner's rule that a merged PLAN is the go for its DO. The approval adds one request: exercise malformed `subject` values, so that the stated contract of one non-empty id is actually verified.

## Delivered

- `lib.mjs` accepts the optional field `subject` of `subject.json` and validates it with `checkSubject()`: a string, one non-empty id, no whitespace. `applications()` takes an optional root, so a Case can read an application it builds. A review without `subject` stays valid, and Review still does not resolve the id, know the kind of the element or check that it exists.
- One application, `applications/control-release-ctl1`, a review with the focus `control` of the element `release/CTL1`, a detective control of the release capability. Its reference and actual are provided, as Review defines no focus for a control. It follows the nine chapters of review/A1 and it is a real review of a real control: it finds that the control reveals a differing stage through the Cases of another Change, and that the one Case that names the control checks its registration.
- T295 and T296 renamed from `.red.mjs` to `.test.mjs`, now green: an application names its element and the record names it too; a review of a control carries its own reference and actual and names its element.
- T297, new, for review/F26: it builds a fresh application and exercises malformed values (empty, whitespace only, a space inside, a leading or trailing space, a tab, a newline, a number, null, a boolean, an array, an object), which are rejected both by `checkSubject()` and by `applications()`. It then exercises well-formed ids and no `subject` at all, which are accepted.

## Checked

- The Cases of the package run green: 12 of 12 in `test/cases.test.mjs` (T28, T29, T21 to T27 over the existing and the new application, and T295, T296, T297), and the packaging tests of `test/review.test.mjs` 9 of 9. The acceptance scenario of review/C2 is unchanged and runs in the Acceptance lane.
- The first draft of the new review failed T28, T29, T22 and T24: a finding named no item of the reference, one finding used a mark Review does not define, and the Reference and Actual chapters did not carry the exact words of `subject.json`. Corrected in the record, no Case was changed.

## Not done

No promotion and no publication. Nothing in the Skill, the Nodes or any other package changed. The review of `release/CTL1` is Review's own judgement and grants no authority over the control.
