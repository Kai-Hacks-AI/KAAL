# C15 DO

Built from the merged PLAN, on the collector `kaal/controls/minimum-evidence`.

- `find-controls.mjs` reads the optional `evidence` line and lists `evidence: [{ kind, runs, fail }]` for every control. A bad line is one problem of `evidence` with a recovery naming the X, the runs and `fail`; the control stays listed and fails validation (controls/F28, controls/F20).
- `evidence.mjs` judges a control that claims `tested` from its declaration and records: PASS, or UNKNOWN (no-minimum, no-records, below-minimum). An X declared `:fail` counts a run only with a RED base run (a different run) under a GREEN head, the base and head comparison the runner already makes.
- `check-controls.mjs --records <path>` fails each `tested` claim that is not PASS with a problem of `status`; without records it reads declarations only, as before.
- `declaring-controls.md` and `judging-status.md` say it; `SKILL.md` is unchanged at 599 words.
- Cases T1086 to T1090 renamed from `.red.mjs` to `.test.mjs`.

## Evidence

- `npm test` in `packages/kaal-controls`: 47 Cases pass (the 42 existing and T1086 to T1090), which were RED on their own assertions before the DO (`evidence.md`).
- Nothing judges, signs or runs on GitHub, and no workflow, ruleset, App or secret was added. No KAAL control declares a minimum yet.
