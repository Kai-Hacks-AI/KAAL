# C35 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G125 | F96 | `verify-workflow-names.yml` checks out the base commit and runs the judge and `judge-mode` from it | for a pull request into a collector that predates the judge the base holds none, so the check is UNKNOWN on every SYNC into a stale collector |
