# C70 baseline

The baseline is the collector `kaal/release/stages-extra-rule` at `main` c90b9fb, with no commit of its own.

- `05-src/stages/judge.mjs` holds the shape of a branch ruleset in code: `the only rule must be required_status_checks`, and its contexts are `verify Stages (<Name>)`, what `requires` lists for Integrating and what `also` lists (release/C59). A second rule is a finding, and no declaration can allow one.
- `05-src/stages/stages.json` declares those checks through `requires` (Integrating) and `also` (Promoting). Nothing names the control that requires a check or a rule.
- The judge reads no control. The set 1 sources hold one rule per branch ruleset: `required_status_checks`.
- Every rule and setting of a ruleset source is a fixed expectation of the judge, not the answer to a declared control: the judge reads no control.
- Cases that read these keys or build the judge's facts: release/T483, T487, T511, T512, T513, T760 and T761 and the shared helper `00-changes/C35-stages/helper.mjs`.
