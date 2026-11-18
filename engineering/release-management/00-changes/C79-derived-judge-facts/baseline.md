# C79 baseline

The baseline is `main` 01d371b.

- `C35-stages/helper.mjs` exports `CONTROLS` (release/CTL1 and CTL5) and builds `GOOD()` from it; `C70-stages-declared-rules/fixtures.mjs` exports its own `CONTROLS` (release/CTL1, CTL5, CTL10, CTL12) and rebuilds the declared rules, the checks and the rulesets of the stages by hand in `declared()`.
- `05-src/stages/judge.mjs` already holds `read(root)`, which reads the real `stages.json`, the six ruleset sources, the `.githooks` tree and the controls found in `04-controls`; the command line judge uses it on the real tree.
- Neither Case helper uses `read`. A control added to `04-controls` is not known to the helper until someone adds it to the list; the collectors of release/C76, C77 and C78 each edit both files for that reason.
