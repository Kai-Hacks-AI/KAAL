# Requirements in the flat layout: Testing

This PLAN changes no existing Case. The planned tests are `packages/kaal-requirements/test/plan/port.test.mjs`. They are immutable to the DO, and run with `node --test packages/kaal-requirements/test/plan/port.test.mjs`.

| Test | Checks | Recorded |
| --- | --- | --- |
| requirements/T400 | `packages/kaal-requirements/package.json` exists and is named `kaal-requirements` [F30] | RED: the package does not exist on main |
| requirements/T401 | the root `package.json` lists `packages/kaal-requirements` as a workspace [F30] | RED: it is not listed |
| requirements/T402 | `ownership.kaal.json` claims `packages/kaal-requirements/` for owner id `b2919630…ec78ec94d` [F32] | RED: no claim file |
| requirements/T403 | the three Nodes hash to the digests the old contract catalogued [F31] | RED: the Nodes are absent |
| requirements/T404 | no file under `test/` imports `kaal-hosting` unscoped [F33] | RED: no test tree yet |
