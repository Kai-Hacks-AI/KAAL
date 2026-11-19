# C13 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/ctl1-check-controls`, each by its own pull request, squashed. The collector is branched from `main`, which already holds the finder of C12 that the Cases need.
2. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, after a sync with `main` if it is behind, and the CPO's approval at its exact head.

This PLAN authorizes no hook, no workflow, no ruleset change and no publication.

## Smallest coherent promotion

One control declaration, its Cases and the files of the Change, under `engineering/controls/`.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T780 to T783 green | verified by Cases |
| Operational | The Engineering check ran T778 on a pull request that carries it | an observed run, for `running` only |
| Validated | The CPO reads the control and judges that the status it claims is right | judgment, not a Case |
