# C10 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/ctl-verify-stages`, each by its own pull request, squashed.
2. ACT goes into the collector, and the collector goes to `main` as one promotion, squashed, after the CPO approves at its exact head.

This PLAN authorizes no DO, no publication and no promotion.

## Smallest coherent promotion

The Intent, the control and the two Cases under `engineering/release-management/`, and this Change folder under `packages/kaal-controls/`. No check, judge, ruleset or workflow changes.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T540 and T541 green: the finder lists release/CTL1 as detective with release/I27, the control test is found from the control, the Intent is answered | verified by Cases |
| Validated | The CPO reads the draft and judges that the control states what `verify Stages` is for and nothing more | judgment, not a Case |
| Operational | None. The control documents an existing check and enforces nothing new | not applicable |
