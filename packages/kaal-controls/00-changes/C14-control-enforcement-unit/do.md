# C14 DO

Built from the merged PLAN, on the collector `kaal/controls/enforcement-unit`.

- `find-controls.mjs` reads the optional `stations` line and lists `stations: [{ station, mode }]` for every control. A bad line is one problem of `stations`, with a recovery naming the stations and the modes; the control stays listed and fails validation (controls/F25, controls/F20).
- `registry.mjs` lists the controls registered at a station from the files of a Git ref (`git ls-tree` and `git show`), never the working tree. It lists only valid controls and exits 1 when the ref cannot be read.
- `references/enforcing-controls.md` says what a station and a mode are, why the registry comes from the base, and when a control should be preventive at a station. `SKILL.md` points at it and stays at 599 words (the old pointer line was shortened by two words to make room). `declaring-controls.md` names the `stations` line.
- Cases T920, T921 and T928 renamed from `.red.mjs` to `.test.mjs`.

## Evidence

- `npm test` in `packages/kaal-controls`: 42 Cases pass (the 39 existing and T920, T921, T928). Before the DO the three Cases were RED on their own assertions (`evidence.md`).
- The 12 old unnamed-Case failures of `engineering/` are unchanged and no other Case fails.
- Nothing judges, signs or runs on GitHub in this slice, and no workflow, ruleset, App or secret was added.
