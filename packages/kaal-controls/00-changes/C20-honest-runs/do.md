# C20 DO

Built from the merged PLAN, on the collector `kaal/controls/honest-runs`.

- `evidence.mjs`: `judgeEvidence` reads `by` and `handled`. A record with no `by` is listed in `unrecorded` and counts nowhere. A RED or UNKNOWN record without `handled` gives the verdict `UNKNOWN` with reason `unhandled`, even when the minimum is met, and is listed in `unhandled`. A record with `handled` is listed in `handledRuns` and counts toward no kind. `stateLine` adds the count of unhandled runs.
- `references/judging-status.md` says what `by` and `handled` hold and the rule on who records a run. `SKILL.md` is unchanged at 599 words.
- Cases T1106 and T1107 renamed from `.red.mjs` to `.test.mjs`. T1087, T1088, T1089, T1091 and T1092 build their records with a `by`. T1088 changes one assertion on purpose, as the PLAN said and the CPO accepted: a RED run beside the minimum is now `UNKNOWN unhandled`, and the same run with `handled` is still `PASS`.

## Evidence

- `npm test` in `packages/kaal-controls`: 52 Cases pass (the 50 existing and T1106 and T1107), which were RED on their own assertions before the DO (`evidence.md`).
- Nothing runs on GitHub in this slice, and no workflow, ruleset, App or secret was added. The converter of controls/C17 does not write `by` yet; no records exist.
