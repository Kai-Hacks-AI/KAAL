# C178 change

## PLAN

1. Record the intent I36, the Requirements F231, F232 and F233 and the Cases T1734, T1735 and T1736 (plain `.test.mjs`).
   - T1734 tests the judge as a pure function over hand-made run reports: a registered Case observed RED by an assertion passes; a registered Case that is GREEN, that errors before its assertion (UNKNOWN), that was not run, or whose Change does not exist, is closed (has its ACT) or does not own that Case is a finding; an unregistered RED, an unregistered UNKNOWN and an incomplete run are findings; a register entry without a Change reference is refused. It is RED on `main` because `test/lib/judge-lane.mjs` is absent.
   - T1736 tests `changesOf`: which Changes are open and which Cases belong to each through Case `tests`, Requirement `serves` and Change `implements`. RED because `test/lib/changes-of.mjs` is absent.
   - T1735 runs the lane (`test/lane.mjs`) end to end on small fixture folders with real `node --test` children, on fixture packages that hold a Change, its Intent, Requirement and Case and an unrelated Requirement and Case, and reads the package's `test` script. Its negative scenarios: a registered Case that passes, errors before its assertion, is unregistered, names a nonexistent Change, is a Case of no open PLAN, or has a closed Change. It is RED on `main` because the lane is absent and `npm test` is the plain `node --test`.
   - Both were run GREEN against a throwaway copy that is not committed (about 100 lines in three files, a register file, the script change and the dev dependency). Without it the suite is 127 GREEN and these three RED. With it the other 127 Cases and the three are GREEN except T1729, which forbids any `devDependencies` and so is amended in the DO (below).
2. No script, register, dependency or workflow changes in the PLAN. This PLAN itself is the last one that fails the lane: its two Cases are RED until the DO, because no register can exist before the lane does.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/observed-red`:

1. `test/lib/judge-lane.mjs`: `judgeLane({ report, register, changes })`, pure, over `compareExpectations` of `kaal-testing/expectations`, as F231 says.
2. `test/lib/changes-of.mjs`: `changesOf(files)` as F233 says, pure.
3. `test/lane.mjs`: runs the package's `test/*.test.mjs` with `runCases` of `kaal-testing/run`, reads `test/plan-register.json` and derives the Changes with `changesOf`, prints the held, the findings and the counts, and exits 0, 1 (findings) or 2 (invalid input).
4. `test/plan-register.json`: `{ "schema": "kaal-testing/expected-failures@1", "expected": [] }`. A PLAN adds its Case ids with `reference` the Change id (`controls/C<n>`) and `id` naming the Case as the lane reports it; the DO removes them.
5. `package.json`: `scripts.test` becomes `node test/lane.mjs`; `devDependencies` gets `kaal-testing` `0.0.1` (the workspace, as other packages already do) and the lock gets its entry. `files` is unchanged: `test/` is not published and the dependency is dev only.
6. T1729 (F227) is amended: it asserts no `devDependencies`; it now allows exactly `kaal-testing` and still forbids `dependencies` and any other script.
7. T1734, T1735 and T1736 GREEN; the whole suite GREEN under the lane. Mutations, each caught: a registered GREEN accepted; a registered UNKNOWN accepted; an unregistered UNKNOWN accepted; an incomplete run accepted; a closed Change's entry accepted; an entry for a nonexistent Change or for another Change's Case accepted; the lane exit code ignored.
8. ACT: a retro entry in the collector. C176 and C177 then add their Cases to the register in their PLAN and take them out in their DO.

## Why this cannot weaken the lane

- A registered Case is not skipped: it runs and is only accepted when it is observed RED by an assertion. Green, an error before the assertion (UNKNOWN), a file that did not run, a timeout, or an incomplete run all fail the lane.
- Every Case that is not registered must be GREEN, so one unregistered RED or UNKNOWN fails it.
- A registered entry is bound to a real, open PLAN and to a Case of that PLAN: an entry for a nonexistent Change, for a Case that does not belong to its Change, or for a Change that records its ACT is a finding, so an unrelated failing Case cannot be registered. A collector promotes after ACT, so no entry survives into `main`, and the DO removes its entries in the same pull request that makes the Cases GREEN.
- The register is a file of the package, reviewed like any other; the lane prints every held id with its Change, so a PLAN's red Cases are visible in the job log and not hidden.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Testing's mechanism, not a copy.** Testing stays the producer of the observation. Testing confirmed that `run --expect` and `compareExpectations` only list and decide nothing, and that the judge belongs to the consumer, as the hold adapter does it. If a second consumer wants the same judge, Testing can PLAN `run --expect --strict`; then this judge is replaced by it. Not before (YAGNI).
2. **Layering.** The package's tests (not published) depend on `kaal-testing`, dev only; Testing depends only on Hosting, so no cycle. This is a layering call for the Owner or CTO.
3. **Engineering Cases runner.** It has no such register today; this Change does not touch it. A later Change can take the same judge there if wanted.

## Not here

The bootstrap of this PLAN itself (its Cases are RED before any register can exist) is not handled here: it is a separate Owner decision.

No WIRE, flag, station, required check, ruleset, npm publish or change of `private`. C176 and C177 stay red until this DO is synced into their collectors.

## DO (done in this pull request, as the approved PLAN authorizes)

The Owner asked for a safe route instead of a bypass. A PLAN with its Cases RED cannot be green in the required lane before the lane that reads a register exists, so the DO is in the same pull request as the PLAN, and the red-to-green evidence is taken against the base:

- On the base (`main`): the suite is 127 GREEN and T1734, T1735, T1736 RED (the files they require are absent).
- On this head: `npm test` of the package is the lane: observed 130 GREEN, 0 RED, 0 UNKNOWN, held 0, findings 0. T1729 is amended as DO step 6 says.
- Mutations, each caught by a Case: registered GREEN accepted; registered UNKNOWN (error before the assertion) accepted; an entry for another Change's Case accepted; an entry of a closed Change accepted; an unregistered UNKNOWN accepted; the lane's exit code ignored.
- The register is empty, so nothing is held and nothing is weakened. ACT (the retro) follows as its own pull request.
