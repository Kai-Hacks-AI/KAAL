# C82 DO

## Placed

- `I50.md`, `F175.md`, `A61.md` under `10-intent`, `11-requirements`, `12-architecture`, equal to the drafts in `interface.md`.
- `packages/kaal-testing/lib/observation.mjs` (`./observation`): `assembleObservation` (pure; the run report is read as untrusted data and checked against the requested files: schema, file list exactly the requested files, no test of an unrequested file, no repeated id, no malformed test) and `observeAt` (`runCases`, `collectCases`, `assembleObservation`).
- `packages/kaal-testing/bin/kaal-testing.mjs`: `observe-at [--root] --revision --expect-revision --run-id --produced-by --out DIR [--report run-report.json] <files…>` writes `DIR/observation.json`; with `--report` it runs nothing. A report that is not JSON is not a run report: every Case UNKNOWN, exit 0. Invalid input exits 2 and writes nothing. `run` and `observe` are unchanged.
- `test/observation.test.mjs` (unit tests: the split form gives the same pair as the one-step form; a garbage, partial, malformed or null report gives UNKNOWN with a named finding and never a crash or GREEN; invalid input writes nothing), added to `npm test`.
- `test/plan/testability/T160.test.mjs` lists `./observation` among the exports (as it did for `./cases` and `./observe`), `test/testing.test.mjs` lists `lib/observation.mjs` among the packed files, and the README describes the record and the command.

## Results (Node 22.23.4)

- `T408` to `T413`: 6 of 6 GREEN in place (RED on the PLAN tree).
- `kaal-testing` `npm test`: 119 pass, 2 fail, the same 2 as on `main` (`T388` and `T369` need Node 24).
- `engineering/contracts/measure.test.mjs`: 7 of 7 pass; the README's pinned quotes are unchanged.

## Not done, by the PLAN

No workflow, flag, ruleset, WIRE or required check; release's reader and assembler are not touched. A well formed report that lies about a verdict is not detected, so hold Act stays advisory.
