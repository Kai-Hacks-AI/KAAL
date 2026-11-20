# C16 DO

Built from the merged PLAN, on the collector `kaal/controls/state-beside-claim`.

- `evidence.mjs` exports `computedState` (`tested` only when the verdict is PASS, `designed` for any other valid control, `invalid` otherwise) and `stateLine` (claim, computed state, progress per kind of X, verdict). Its command prints a line for every control that declares `evidence`, whatever its status, or the verdicts with `--json`, and exits 1 only for a `tested` claim that is not shown.
- `references/judging-status.md` says what the line shows and that the claim stays a claim. `SKILL.md` is unchanged at 599 words.
- Cases T1091 to T1093 renamed from `.red.mjs` to `.test.mjs`.

## Evidence

- `npm test` in `packages/kaal-controls`: 50 Cases pass (the 47 existing and T1091 to T1093), which were RED on their own assertions before the DO (`evidence.md`).
- Nothing runs on GitHub in this slice, and no workflow, ruleset, App or secret was added.
