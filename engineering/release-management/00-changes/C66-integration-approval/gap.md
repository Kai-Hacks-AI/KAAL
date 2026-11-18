# C66 gap

No gap id is allocated: this Change answers the Owner's ruling and the Intent release/I36.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| release/CTL10 answering release/I36 | the new rulesets require no approval; the old integration ruleset requires one on `kaal/**` only | a merge into `hotfix/**` or `wire/**`, and any merge once the old ruleset retires, needs no approval; an approval stays after a later push |
| `integrating.json` | checks only | no `pull_request` rule |
| `stages.json` and the judge | a branch ruleset holds one rule | the second rule cannot be declared or accepted (precursor) |
