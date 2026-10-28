# Features Accept Regression: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/far.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-change`'s `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T9: a well-formed proposal has no findings, and each malformed member is a finding naming it | change/I6, change/F7 | Intent |
| change/T10: accepting yields exactly `{ change, tests }` with every proposed Test Case, sorted | change/F8, change/F9 | Requirements |
| change/T11: narrowing yields only its subset, and a subset that is empty, whole or reaches beyond the proposal yields nothing | change/I7, change/F8, change/F9 | Intent |
| change/T12: rejecting and redesigning yield nothing, and neither does a decision without authority or evidence, or a proposal with a finding | change/I7, change/F8, change/F9 | Requirements |
| change/T13: decided proposals assemble into one `far` list sorted by Change, and two decisions for one Change hand on neither | change/I8, change/F10 | Requirements |
| change/T14: the same input gives the same result, the input is unchanged, and no decisions give an empty list | change/N3, change/N4 | Architecture |

The following are validated by review:
- `change/A6` and `change/A8` are placements.
- `change/A7` rests on the repository's controls.
- That an accepted regression stays RED, and that acceptance edits no Test Case, are `testing/F5`'s and Testing's tests.

## RED evidence

At `change/C2`, all six tests are RED, and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./far`. They run with `node --test packages/skills/kaal-change/test/plan/far.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.
