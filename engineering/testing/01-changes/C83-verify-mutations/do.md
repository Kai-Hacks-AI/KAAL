# C83 DO

## Placed

- `I51.md`, `F176.md`, `A62.md` under `10-intent`, `11-requirements`, `12-architecture`, equal to the drafts in `interface.md`.
- `packages/kaal-testing/lib/mutate.mjs` (`./mutate`): `runMutants` validates the spec, runs the union of the Cases on an unmutated scratch copy (the baseline), then runs each mutant's Cases on its own scratch copy, and returns the record `kaal-testing/mutation-report@1`. `classify` is pure over a run report: killed on a RED test, survived on a complete run with every test GREEN, unresolved otherwise; invalid is decided before a run (absent, repeated or unchanged `find`, or a baseline that is not ok). `root` is never changed.
- `packages/kaal-testing/bin/kaal-testing.mjs`: `mutate --root --spec --out [--timeout]` writes `DIR/mutation-report.json`. Exit 0 whenever the record was written, 2 for an invalid spec with nothing written. `run` and `observe` are unchanged.
- `T160` and `T369` list `./mutate` among the exports, `test/testing.test.mjs` lists `lib/mutate.mjs` among the packed files, and the README describes the command and record.

## Results (Node 22.23.4)

- `T414` to `T419`: 6 of 6 GREEN in place (RED on the PLAN tree).
- `kaal-testing` `npm test`: 115 pass, 2 fail, the same 2 as on `main` (`T388` and `T369` need Node 24).
- `engineering/contracts/measure.test.mjs`: 7 of 7 pass.

## Not done, by the PLAN

No mutant generation, workflow, flag, ruleset, WIRE or required check. The record decides no verdict; whether a survivor is an equivalent mutant or a gap is judged by a reader. This DO branches from `main`; the C82 collector also edits `package.json`, `T160`, `T369`, `testing.test.mjs` and the README, so the second collector to land takes a SYNC.

## Interim state before the SYNC

`main` now holds C82, which changes the same files as this DO (`package.json`, the bin, the README, `T160`, `T369`, `testing.test.mjs`), so a SYNC of `main` into this collector would conflict. To let the SYNC merge clean, a DO commit takes this Change's edits out of those six files and out of `lib/mutate.mjs`. The placed docs `I51`, `F176`, `A62` and the Cases stay. After the SYNC, a second DO puts the same code and edits back on top of `main`, so `T417` to `T419` are RED on the collector in between.
