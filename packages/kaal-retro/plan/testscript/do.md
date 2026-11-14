# DO (retro/C3)

Delivered: `pretest` in `package.json` now builds kaal-core by path (`npm run build --prefix ../kaal-core`). Nothing else in the package changed, and nothing in the root.

## Check

Before: retro/T16 failed, `npm test` in the package stopping at `pretest` with "No workspaces found". After: `npm test` in `packages/kaal-retro` builds kaal-core and reports 15 tests, 15 pass, 0 fail (T1 to T15), and T16 passes (`node --test test/plan/testscript.test.mjs`). `npm pack --dry-run` lists the same files as before.

## Correction to retro/C2

The DO text of retro/C2 (#1644) said `npm test` in the package gave 15 pass. That was not what had been run: only `node --test` on the two test files had been, with kaal-core already built. `npm test` in the package failed at `pretest`. That text is superseded by this one. The ACT of retro/C3 records the miss.

## Not done

Wiring, publishing, registering Retro in `.kaal/`, root workspaces, and promotion.

## Case corrected

retro/T16 as planned failed after the fix for a reason of its own: run inside `node --test`, the child `npm test` inherited `NODE_TEST_CONTEXT` and node skipped it as a recursive run, so it printed no results. The Case now runs the child with that variable removed. It asserts the same things as planned. It was RED for the right reason before (the `pretest` error) and is green now for the right reason (15 of 15 reported by the package script).
