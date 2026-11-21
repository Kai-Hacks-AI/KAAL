# C20 change

## PLAN

1. Add the gap G97, the Intent I14, the Requirement F33 and the Architecture A19, with the draft in `interface.md`, and the Cases T1106 and T1107 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, control or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. In `evidence.mjs`: add `by` and `handled`, the lists `unrecorded`, `unhandled` and `handledRuns`, and the reason `unhandled`, and show the count of unhandled runs in the state line. Rename the Cases to `T<n>.test.mjs`. The Cases of controls/C15 and C16 that build records (T1087 to T1089, T1091 and T1092) get a `by`. One of their assertions changes on purpose: T1088 now asserts that a PASS with an unexplained RED run beside it is still `PASS` and lists it in `notGreen`. Under this Change that run blocks, so the DO changes that one assertion to `UNKNOWN` with reason `unhandled`, and adds the same run with `handled` still `PASS`. It is a ratified Case changing its mind, and the CPO is asked to see it here.
2. Add the two lines to `judging-status.md`.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- Who may handle a run is not checked: `handled` is words or a pointer, and whether the explanation is true is a review's, not a script's.
- That the recorder is not the author is a rule in the reference. A script cannot tell who wrote a Case.
- The converter of controls/C17 does not write `by` yet, so what it writes is `unrecorded` until Engineering changes it, in its own Change. No records exist, so nothing breaks.
- controls/C18 also changes `judgeEvidence` and the state line, and controls/C19 the state line: whichever DO lands second adapts to the first.
