# C20 baseline

Observed on `main` at the head of the collector:

- Three GREEN runs of the real kind plus two RED runs of the same Case on that kind, none explained, give `PASS` and `computed tested`: `notGreen` lists the two and changes nothing.
- A record `{ case, x, run, outcome }` with no `by` counts as a run like any other.
- `references/judging-status.md` says what a record holds and which runs count; it says nothing on who records a run, nor on a run that did not come out GREEN beyond "never counts".
- No control has recorded runs yet, so the stricter rule breaks no claim and no state line.
- controls/T1088 (C15) asserts exactly this: an extra RED run beside the minimum is `PASS` and appears in `notGreen`.
