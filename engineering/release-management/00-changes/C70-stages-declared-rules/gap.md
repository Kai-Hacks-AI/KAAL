# C70 gap

No gap id is allocated: this Change prepares release/C66 and closes no recorded gap.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `05-src/stages/judge.mjs` | the shape of a ruleset is code: one rule, checks from two special keys | a ruleset with a second rule, or a rule a control declares, is a finding by construction; a check or rule traces to no control |
| `05-src/stages/stages.json` | `requires` and `also` name checks only | the declaration does not say which control requires a rule, a check or a setting, nor what the settings are |
