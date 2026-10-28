# FAR, Features Accepted Regression: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/far.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

The DO Change turns them GREEN, adds them to `kaal-change`'s `npm test`, and may add Code tests of its own. They give Plans as `{ plan, cases }`, and Testing's evaluations as plain data.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T9: a well-formed proposal has no findings, and each identity or member it breaks is a finding naming it | change/I6, change/F8 | Intent |
| change/T10: accepting yields the Regression Plan's exceptions for every proposed Case, each citing the Change and its integration | change/F9, change/F10 | Requirements |
| change/T11: narrowing yields only its subset, and a subset that is empty, whole or reaches beyond the proposal yields nothing | change/I7, change/F9, change/F10 | Intent |
| change/T12: rejecting and redesigning yield nothing, and neither does a decision without authority or evidence, or a proposal with a finding | change/I7, change/F9, change/F10 | Requirements |
| change/T13: compose reports accepted Cases still RED, and finds an excepted Features evaluation and mismatched Regression exceptions | change/I6, change/F11 | Intent |
| change/T14: the same input gives the same result, the input is unchanged, and a record without an Accept yields no exceptions | change/N3, change/N4 | Architecture |
| change/T15: exceptions never transfer to another integration, whether its source Change, source revision, target or baseline differs | change/I7, change/F10 | Intent |
| change/T16: each Plan must be the one the record names, read at its revision: Features at the source's, Regression at the baseline | change/I5, change/F7, change/F11 | Requirements |

The following are validated by review:
- `change/A6` and `change/A8` are placements.
- `change/A7` rests on the repository's controls and on Review.
- That Testing reports an excepted Case RED is Testing's contract, in its Test Plan PLAN.

## RED evidence

At `change/C2`, all eight tests are RED, and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./far`. They run with `node --test packages/skills/kaal-change/test/plan/far.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.
