# C178 change

## PLAN

1. Record the intent I36, the Requirements F231 and F232 and the Cases T1734 and T1735 (plain `.test.mjs`).
   - T1734 tests the judge as a pure function over hand-made run reports: a registered Case observed RED by an assertion passes; a registered Case that is GREEN, that errors before its assertion (UNKNOWN), that was not run, or whose Change already has its ACT is a finding; an unregistered RED, an unregistered UNKNOWN and an incomplete run are findings; a register entry without a Change reference is refused. It is RED on `main` because `test/lib/judge-lane.mjs` is absent.
   - T1735 runs the lane (`test/lane.mjs`) end to end on small fixture folders with real `node --test` children, and reads the package's `test` script. It is RED on `main` because the lane is absent and `npm test` is the plain `node --test`.
   - Both were run GREEN against a throwaway copy that is not committed (about 60 lines in two files, a register file, the script change and the dev dependency). Without it the suite is 127 GREEN and these two RED. With it the other 127 Cases are GREEN except T1729, which forbids any `devDependencies` and so is amended in the DO (below).
2. No script, register, dependency or workflow changes in the PLAN. This PLAN itself is the last one that fails the lane: its two Cases are RED until the DO, because no register can exist before the lane does.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/observed-red`:

1. `test/lib/judge-lane.mjs`: `judgeLane({ report, register, closed })`, pure, over `compareExpectations` of `kaal-testing/expectations`, as F231 says.
2. `test/lane.mjs`: runs the package's `test/*.test.mjs` with `runCases` of `kaal-testing/run`, reads `test/plan-register.json` and the Changes whose ACT is recorded, prints the held, the findings and the counts, and exits 0, 1 (findings) or 2 (invalid input).
3. `test/plan-register.json`: `{ "schema": "kaal-testing/expected-failures@1", "expected": [] }`. A PLAN adds its Case ids with `reference` the Change id (`controls/C<n>`); the DO removes them.
4. `package.json`: `scripts.test` becomes `node test/lane.mjs`; `devDependencies` gets `kaal-testing` `0.0.1` (the workspace, as other packages already do) and the lock gets its entry. `files` is unchanged: `test/` is not published and the dependency is dev only.
5. T1729 (F227) is amended: it asserts no `devDependencies`; it now allows exactly `kaal-testing` and still forbids `dependencies` and any other script.
6. T1734 and T1735 GREEN; the whole suite GREEN under the lane. Mutations, each caught: a registered GREEN accepted; a registered UNKNOWN accepted; an unregistered UNKNOWN accepted; an incomplete run accepted; a closed Change's entry accepted; the lane exit code ignored.
7. ACT: a retro entry in the collector. C176 and C177 then add their Cases to the register in their PLAN and take them out in their DO.

## Why this cannot weaken the lane

- A registered Case is not skipped: it runs and is only accepted when it is observed RED by an assertion. Green, an error before the assertion (UNKNOWN), a file that did not run, a timeout, or an incomplete run all fail the lane.
- Every Case that is not registered must be GREEN, so one unregistered RED or UNKNOWN fails it.
- A registered entry is bounded by its Change: once the Change records its ACT, the entry is a finding. A collector promotes after ACT, so no entry survives into `main`, and the DO removes its entries in the same pull request that makes the Cases GREEN.
- The register is a file of the package, reviewed like any other; the lane prints every held id with its Change, so a PLAN's red Cases are visible in the job log and not hidden.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Testing's mechanism, not a copy.** Testing confirmed that `run --expect` and `compareExpectations` only list and decide nothing, and that the judge belongs to the consumer, as the hold adapter does it. If a second consumer wants the same judge, Testing can PLAN `run --expect --strict`; then this judge is replaced by it. Not before (YAGNI).
2. **Layering.** The package's tests (not published) depend on `kaal-testing`, dev only; Testing depends only on Hosting, so no cycle. This is a layering call for the Owner or CTO.
3. **Engineering Cases runner.** It has no such register today; this Change does not touch it. A later Change can take the same judge there if wanted.

## Not here

No WIRE, flag, station, required check, ruleset, npm publish or change of `private`. C176 and C177 stay red until this DO is synced into their collectors.
