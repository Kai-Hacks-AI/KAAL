# C24 change

## PLAN

1. Add the gap G101, the Requirement F38 and the Case T1119 (plain `.test.mjs`, never renamed). T1119 is RED on main.
2. Change F37 item 2 on purpose, recorded here: `baseline-source` is the path of the baseline file (F38). T1118 is unchanged; its fixtures name a path.
3. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `ratchet.mjs` with `judgeRun`; `judge-mode.mjs` calls it. The Cases T1108 to T1117 stay GREEN unchanged.
2. `find-controls.mjs`: the baseline-file rule of F38, with a recovery.
3. `modes.md` and `declaring-controls.md`: the baseline file and the base-read rule, in the existing space (SKILL.md stays at or under 600 words).

## ACT

A retro entry in the collector.

## Recorded in the DO

- T1118 (C23) changes on purpose: the PLAN said its fixtures already named a path, but they wrote prose in `baseline-source`. Its fixtures now name `x/baseline.json` and provide the file; the assertions are the same.
- The directory readers (`find-controls.mjs`, `check-controls.mjs`, `registry.mjs`) also read `.json` files (not `package-lock.json`) so the baseline file is among the files the finder sees. The source is matched by path, or by path suffix when the directory is scanned from a subfolder.
- The C22 mutation patches M1 to M5 now target `ratchet.mjs`, where the comparison lives; M6 to M8 are unchanged.

- Promotion evidence so far: `check-controls` with this finder on main's real controls says CTL36 valid and release/CTL20 invalid (`baseline-source is not the path of a JSON file`), every other control as before. This is why the collector is not promoted until release's CTL20 change is on main; the same run is repeated then.

## Sequence with release (no invalid state, no loss of enforcement)

Today CTL36's `baseline-source` is already the path of a valid `baseline.json` (a list of unique strings) and stays valid. CTL20's `baseline-source` is prose and it has no baseline file, so the strict finder of C24 would list it as invalid. The order is expand, then tighten:

1. **Release adopts first, on the current finder.** Release's own Change gives CTL20 a `baseline.json` with its five workflows, sets `baseline-source` to that path (free text today, so valid under the old and the new finder), and switches its judge to read the base's file. It proves, before the switch, that the file equals what the judge derives today, so enforcement is the same on both sides of the change. CTL36 needs nothing.
2. **C24's DO merges into its collector** (not main). The collector is promoted only after release's CTL20 change is on main, and the promotion evidence is `check-controls` run with the DO's finder on the real controls of main: every control valid, CTL20 and CTL36 included. Until then main keeps the lenient finder and nothing is invalid.
3. **C25 follows the same rule**: `judgeProgress` answers UNKNOWN when a history is missing and the finder does not require the file, so adding it breaks no control. Release then adds `history.jsonl` to CTL20 and CTL36 in its own Change.

The promotion order is enforced by the PLAN's promotion note (the sync of the collector names it), not by a flag. Release confirms this order before the DO.

## Left open

- Whether the file check belongs to the finder (a declaration check that reads a second file) or to `check-controls.mjs`. Recommendation: the finder, so a control with a missing baseline never appears as valid.
- Whether the file is named `baseline.json` by convention or by `baseline-source` alone. Recommendation: `baseline-source` names it; `baseline.json` is the usual name.
- Ids G101, F38, T1119 are taken by hand; on a clash the newer pull request renumbers.
