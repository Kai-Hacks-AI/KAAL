# C90 evidence

Observed on Node 24, on `main` dca7172 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the ten Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1116 | `release/CTL19 is not listed` |
| T1117, T1118, T1119 | the element file (`I50.md`, `F67.md`, `A62.md`) is absent |
| T1120, T1121, T1122, T1123, T1124, T1125 | `05-src/triggers/verify-triggers.mjs` cannot be found (T1124 also needs the workflow source) |

`node --test engineering/cases/cases.test.mjs` on this tree: 233 tests, 221 pass, 12 fail. The 12 are the C15 collector-capability Cases (T268 to T279) that also fail on `main`; this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner, so the tree is as green as `main`.

## Each Case can pass (throwaway copy)

In a throwaway copy of the tree with the DO's files taken from the drafts in `interface.md` and T1116 to T1122, T1124 and T1125 renamed `.test.mjs`:

- T1116, T1117, T1118, T1119, T1120, T1121, T1122, T1124 and T1125 pass.
- T1123 stays RED on purpose: five workflows still use the trigger (`change-isolation`, `lineage-synchronization`, `merge-group-admission`, `promotion-source`, `sync-review`). It is held `.red.mjs` until the count is 0.
- The runner on that copy: 242 tests, 230 pass, the same 12 fail. No other Case is affected.
- The command line passes the real tree against itself: `node 05-src/triggers/verify-triggers.mjs --base HEAD --head HEAD` prints `PASS`, exit 0.
- A text search finds ten mentions of the trigger in the five files (two per file: the `on:` key and a comment); the judge counts five, because only the `on:` key is a use.

## What the DO must handle

- The five workflows keep the count at 5 until the Inspector and Dispatcher replace them; the ratchet only stops it from rising.
- T1125 reads the five recorded file names in `baseline.md` and asserts each still uses the trigger; it retires at the ACT, before the first one is removed.
