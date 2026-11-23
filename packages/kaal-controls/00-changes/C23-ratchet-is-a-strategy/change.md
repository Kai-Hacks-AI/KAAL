# C23 change

## PLAN

1. Add the gap G100, the Requirement F37 and the Case T1118 (plain `.test.mjs`, never renamed).
2. Change the target documents on purpose, recorded here: F34 item 1 (modes at a station are `detective` and `preventive`; the ratchet declaration moves to F37) and Case T1110 (asserts `X:ratchet` is refused and that `exit` alone, without the strategy, is a listed problem). T1110 and T1118 are RED on the finder of main.
3. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `find-controls.mjs`: `MODES` is detective and preventive; the fields `strategy`, `baseline-source`, `owner` are known; the rules of F37 with a recovery for each.
2. `modes.md`, `enforcing-controls.md`, `declaring-controls.md`: replace "a ratchet is a station mode" with the strategy declaration, in the existing space (SKILL.md stays at or under 600 words).
3. Run the package suite and the mutation runner of C22 (unchanged, it targets `judge-mode.mjs`).

## ACT

A short retro entry in the collector (`controls/RT1` addition or `RT2`, as the CPO prefers): what the C21 registration cost and how the direction was found.

## Left open

- Field names `strategy`, `baseline-source`, `owner` are proposed; the CPO may rename them in review.
- Ids G100, F37, T1118 are taken by hand; on a clash the newer pull request renumbers.
- Release adopts the declaration for CTL19 under its own release Change (C130); this Change gives the generic contract and a finder that accepts it.
