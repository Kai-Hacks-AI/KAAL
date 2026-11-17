# C70 gap

No gap id is allocated: this Change prepares release/C66 and closes no recorded gap.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `05-src/stages/judge.mjs` and the declaration in `stages.json` | a branch ruleset holds one rule | a ruleset source with a second rule fails `verify Stages`, so a control that is a rule beside the checks (release/CTL10) cannot be declared or delivered |
