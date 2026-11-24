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

## Left open

- Whether the file check belongs to the finder (a declaration check that reads a second file) or to `check-controls.mjs`. Recommendation: the finder, so a control with a missing baseline never appears as valid.
- Whether the file is named `baseline.json` by convention or by `baseline-source` alone. Recommendation: `baseline-source` names it; `baseline.json` is the usual name.
- Ids G101, F38, T1119 are taken by hand; on a clash the newer pull request renumbers.
