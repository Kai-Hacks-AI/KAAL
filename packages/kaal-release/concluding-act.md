# kaal/release/pull-next: concluding ACT of the collector (4L)

This is the **concluding collector-level retrospective** of `kaal/release/pull-next` (`pull/F34`): the qualification retrospective for the whole collected work. It replaces the file that concluded `kaal/release/plan`, which has been promoted to `main`. The retrospective of the individual Change stays where it is, as Change history: `plan/pull-next`. It is written after the last PLAN, DO and Case change of the collector, by the agent that carried `pull/C9`.

## What the collector holds

- **The value-density rule for next** (`pull/C9`, `pull/F38`): `next` is the one qualifier, or the strictly highest `value ÷ size` when every qualifier carries a valid `value`, `size` and the same `unit`, compared exactly. A tie, a missing or invalid input, or different units are judged and name the candidates. The Owner owns `value`; the CPO advises and reviews the recorded declaration. It is a value-density heuristic, not WSJF.
- **Cases** `pull/T38` and `pull/T39` (green), `pull/T30` updated to the new rule, and the README chapter "Which qualifier is next".

## Liked

- The CPO's review made the rule refuse to guess: a missing size is judged, never defaulted, and units must match. Each refusal became a RED Case before any code, and each went green with one function.
- Qualification, `missing` and `qualifiers` stayed exactly as they were, which T38 checks.

## Learned

- Function point analysis measures size, not value. It can only inform `size`, and only under one unit and counting method.
- An older Case can pin a rule that a PLAN replaces. T30 asserted the first qualifier as next, and the DO updated it as the PLAN foresaw.
- A first-run Branching failure on a new PR clears on the auto-merge re-run, so it was not read as a defect.

## Lacked

- A statement from the host that this collector qualifies. This file does not claim it: the qualification is a separate run at the exact head after the SYNC, and its raw output is what counts, not this text.
- Recorded values, sizes and units in `declaration.json`. Until the Owner records them, several qualifiers are judged. That is a separate Change and an Owner decision.

## Longed For

- The Owner's values and sizes recorded and reviewed, so `next` is deterministic.
- The pull lane (`pull/C10`) calling the same `chooseNext` after a failed re-qualification.
- Promotion decided by the Owner on the advisory report, not by the report.
