# C95 evidence

Observed on Node 24, on `main` 0a9cfca5 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the six Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1159 | the element file `I53.md` is absent (and the reader that reads the declaration is absent) |
| T1160 | `decideFinal` skips `.kaal/config/guard/Branching.md` as `malformed-wire`: the classifier spells `.github` and `.githooks` only |
| T1161 | `judge` calls a copy under `.kaal/` wrong: `wire-judge.mjs` spells `ZONE` itself |
| T1162, T1164 | `05-src/delivery/locations.mjs` is absent |
| T1163 | `final-step.mjs` spells a root |

`node --test engineering/cases/cases.test.mjs` on this tree: 277 tests, 265 pass, 12 fail. The 12 are the C15 collector-capability Cases (T268 to T279) that also fail on `main`; this PLAN adds none. All `T*.test.mjs` under `engineering/release-management`: 258 tests, 258 pass. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of `engineering/release-management` with the DO's files taken from the drafts in `interface.md` (`I53.md`, `F71.md`, `A66.md`, `delivery-locations.json`, `locations.mjs`, the changed `final-step.mjs` and `wire-judge.mjs`) and T1159 to T1164 renamed `.test.mjs`, all six pass. All `T*.test.mjs` of that copy: 264 tests, 264 pass: the 258 of the baseline, which includes the install judge's own Case (release/T282) and the Cases of release/C93 (T1153, T1154, T1157, T1158, T944), unchanged and green, plus the six.

## What is not proven

That `.kaal` should be wirable without limit (a decision for the Owner, see `change.md`), and that the two other lists (Pull Promotion's evidence rule, Change Isolation) can read the same declaration; that is the next slices' question.
