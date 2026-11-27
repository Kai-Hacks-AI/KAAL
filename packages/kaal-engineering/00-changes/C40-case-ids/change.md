# C40 change

## What changes

Each of `T1239.test.mjs` and `T1240.test.mjs` gains three lines before `run`: `export const id` (`engineering/T1239`, `engineering/T1240`), `export const tests` (`engineering/F55`, as their header already says) and `export const title`, the claim in plain words. No assertion is touched.

## Decisions

1. **Not a change of expectations.** What each Case pins is the same. The Case gains the identity Testing needs to read it, which is a repair, as the Owner and CPO ruled for Cases that keep their expectations.
2. **No DO:** the edited Cases are the whole change. The collector goes to PROMOTION with its ACT.
3. **Checked:** with the edit, Testing's `collectCases` returns both Cases and no finding for the F55 folder, and `kaal-testing run` of both is GREEN. No other Case file in the repository lacks an id.

## Not in this Change

Testing's catalog, hold Act and its verdict (Release's), and any WIRE.
