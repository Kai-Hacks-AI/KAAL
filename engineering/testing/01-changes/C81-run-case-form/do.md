# C81 DO

## Placed

- `I49.md`, `F174.md`, `A60.md` under `10-intent`, `11-requirements`, `12-architecture`, equal to the drafts in `interface.md`.
- `packages/kaal-testing/lib/run-case.mjs`: the entry of every run child. It imports the Case file (node:test tests register as it loads) and registers `run()` as one test when the file exports a callable `run`, named by its `id` or else its path.
- `packages/kaal-testing/lib/run.mjs`: the child starts on that entry with the Case file named in `KAAL_TESTING_CASE`; `reconstruct(events, file, entry)` also accepts the entry's name for the file-level event. No change to the report schema, to `observe`, or to a node:test file's behaviour.
- `test/boundary.test.mjs`: `node:test` is declared for Testing's delivered code, and the one dynamic `import(...)` of the Case file is recorded as a judged validation item. `test/testing.test.mjs` lists the new packed file.

## Results (Node 22.23.4)

- `T402` to `T407`: 6 of 6 GREEN in place (RED on the PLAN tree).
- `kaal-testing` `npm test`: 115 pass, 2 fail, the same 2 as on `main` (`T388` and `T369` need Node 24).
- The 15 fixtures of `testing/C63` give the same `execution.complete`, counts and problems before and after, apart from the intended change to nothing.
