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
| change/T15: *revised.* exceptions never transfer to another integration whose Change or boundary differs, and a different revision alone neither authorizes nor voids them; a Case whose digest differs gets no exception | change/I7, change/I24, change/F10 | Intent |
| change/T16: *revised.* each Plan must be the one the record names: Features read at the PLAN's landing commit, Regression at the protected baseline, and each Case by identity and digest; a Case added to the target after the PLAN landed gets no exception; the Features Cases executed are the landing's, and a DO-supplied replacement is not read | change/I5, change/F7, change/F11 | Requirements |
| change/T60: without an authorization naming the exact PLAN and the designated authority, or without a verified landing given as data, there are no exceptions and a finding; a cite names the PLAN, the landing and the authority | change/I24, change/F50 | Intent |
| change/T61: an authority other than the one given as data, or evidence that is not the decision's landing, authorizes nothing, a candidate-carried `by` and `evidence` are never self-authenticating, and the designation is never read from the record | change/I24, change/F50, change/N3 | Requirements |
| change/T62: a DO that removes, skips, marks or edits a PLAN's Case is a finding naming the Case, and so is an altered Accept or an Accept the PLAN did not establish | change/I25, change/F51 | Intent |
| change/T63: a PLAN Change decided by the designated authority may change Cases and Accepts, and is judged by authorization, not as a DO | change/I25, change/F51 | Requirements |
| change/T64: an Accept whose end condition has passed gives no exceptions and a finding; the outstanding count and conditions are reported; growth beyond the authorized count is a finding | change/I7, change/F52 | Intent |
| change/T65: an Accept serves one Change into one boundary; the same weakening at another boundary has no exception until it has its own authorized entry, and that a PLAN is in history or authorized a collector integration authorizes nothing at `main` | change/I24, change/F53 | Requirements |
| change/T66: an unreadable record, an untraceable entry, an unverifiable authority and a condition that cannot be judged each give no exceptions, a finding naming which, and no passing `compose` | change/I25, change/F54 | Intent |

The following are validated by review:
- `change/A6` and `change/A8` are placements. That the gate reads the landing commit and the designation is Engineering's PLAN (#1340).
- That G13's outcome fits `change/A7` is checked when the Owner decides it.
- `change/A7` rests on the repository's controls and on Review.
- That Testing reports an excepted Case RED is Testing's contract, in its Test Plan PLAN.

## RED evidence

At `change/C2`, T9–T16 are RED and each is **blocked before behavioural assertion**, because `kaal-change` exports no `./far`. They run with `node --test packages/skills/kaal-change/test/plan/far.test.mjs`, outside `kaal-change`'s `npm test` until the DO Change.

T15 and T16 are revised in place, and the existing Cases that assert the superseded contract (T10 expects exceptions from a record without authorization; T15 voids exceptions on a revision change alone; T16 reads the Regression Plan at the wrong revision) can no longer be GREEN with the revised requirements. `far.test.mjs` is immutable to a DO and is not edited here.

The pre-DO test Change is therefore a PLAN-type Change, decided by the designated authority (change/F51), and it both replaces T10, T15 and T16 under their identities with Cases that assert the revised contract, openly traced to this PLAN (no silent change), and adds T60–T66 as RED Cases. The DO is judged by that result and cannot edit it (change/I25).
