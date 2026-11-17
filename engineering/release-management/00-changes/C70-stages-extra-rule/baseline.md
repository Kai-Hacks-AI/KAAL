# C70 baseline

The baseline is the collector `kaal/release/stages-extra-rule` at `main` c90b9fb, with no commit of its own.

- `05-src/stages/judge.mjs` requires the rules of a branch ruleset to be exactly `required_status_checks` (`the only rule must be required_status_checks`), and its contexts to be the stage's own check, then the full names in `also` of the stage (release/C59).
- `05-src/stages/stages.json` declares `also` for Promoting and no `alsoRules` for any stage.
- The set 1 sources hold one rule per branch ruleset.
- The judge reads a branch ruleset's parameters only for its checks and for "up to date" being off. It does not read the parameters of another rule, because there is none.
