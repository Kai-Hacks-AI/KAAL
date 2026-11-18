# C92 evidence

Observed on Node 24, on `main` 733d84b9 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the ten Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1139, T1140, T1141 | the element file (`I51.md`, `F69.md`, `A64.md`) is absent |
| T1142 to T1147 | `verdict.mjs` is absent |
| T1148 | `gatherEvidence` is not exported by `gather.mjs` |

`node --test engineering/cases/cases.test.mjs` on this tree: 266 tests, 254 pass, 12 fail. The 12 are the C15 collector-capability Cases (T268 to T279) that also fail on `main`; this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy with the DO's files taken from the drafts in `interface.md` (`I51.md`, `F69.md`, `A64.md`, `verdict.mjs`, `gatherEvidence` appended to `gather.mjs`) and T1139 to T1148 renamed `.test.mjs`, all ten pass. The runner on that copy: 276 tests, 264 pass, the same 12 C15 failures. Nothing that exists today is made stale by the drafts; `dispatch.mjs` and the Cases of release/C72 and release/C73 are untouched in the copy, and the DO's use of the new functions in `dispatch.mjs decide` is the DO's work.

## What the Cases do not prove

The readiness count is the file count of `change.md`, not the runner's GREEN. The Cases prove the rule on that count (RED means not ready, `act-before-green`, UNKNOWN never passes), not that every `.test.mjs` on a collector passes.
