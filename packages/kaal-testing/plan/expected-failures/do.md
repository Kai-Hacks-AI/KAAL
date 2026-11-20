# Known failures: DO (testing/C68)

`testing/C68` is the DO of `testing/C67` (#2114, CPO approved, merged into the collector). The boundary stands: Testing lists, the consumer decides. The CPO's gate for this DO was to keep provisional absence and incomplete-execution semantics, so that no conclusion is stronger than the observation behind it.

## What it delivers

- `lib/expectations.mjs` (`compareExpectations`, `checkRegister`, no I/O, no import) and the export `./expectations`.
- `kaal-testing run --expect <register.json>`: the command reads the register through Hosting, checks it, and adds `expectations` to the report. A register that cannot be read or is invalid exits 2 without a report.
- A section "Expected failures" in the README and in the Skill, in the abstract words of the PLAN (register, owner, consumer).
- The Cases testing/T374 to T377, renamed from `.red.mjs` to `.test.mjs` without a change of content, run from `test/plan/expected-failures.test.mjs` and added to Testing's `npm test`. `run-red.mjs` is removed, since the wrapper replaces it.
- One test the PLAN did not plan, `test/expectations.test.mjs`: the CPO's gate on the pure function. An id missing from a file that had execution problems is `absent` and `provisional` with the reason; an id of a file that was not run is provisional, and one missing from a complete file is not; what was observed in an incomplete run is still listed as observed; inputs are not changed; an invalid register is rejected.
- T160's pinned lists name the new export and the new Skill section, and the pack list in `testing.test.mjs` names `lib/expectations.mjs`.

## Differences from the PLAN, disclosed

- The output gains `complete`, which repeats whether the run was complete, so a consumer reads the strength of the observation next to the list. No Case required it and none forbids it.
- The command checks the register before it runs the tests, so a bad register costs no run.

## Results

T374 to T377 and `test/expectations.test.mjs` pass on Node 24.22.1 with the registry reachable (Hosting installed from it). The other Testing tests could not run in my sandbox because the workspace dependencies are not built there, so CI is the check for them.

## What it does not claim

Where the register lives, how entries get in or out, how a finding becomes an entry and how a merge or a release is judged on the list belong to other owners and other Changes. No promotion, activation or publication is claimed. The executable bit of `bin/kaal-testing.mjs` is fixed by the standalone Change (testing/C66) on its own collector; this DO does not touch it.
