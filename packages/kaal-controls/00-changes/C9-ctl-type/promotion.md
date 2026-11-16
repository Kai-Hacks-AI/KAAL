# C9 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/ctl-type`, each by its own pull request, squashed.
2. ACT goes into the collector, and the collector goes to `main` as one promotion, squashed, after the CPO approves at its exact head.

This PLAN authorizes no DO, no publication and no promotion.

## Smallest coherent promotion

Everything under `packages/kaal-controls/` that this Change adds or edits. Nothing outside the folder changes.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T530 to T536 green, and the Cases of C8 still green with a type | verified by Cases |
| Validated | The CPO reads F16 and A9 and judges that the type field is right and nothing more was added | judgment, not a Case |
| Operational | None. The finder lists and checks a value and enforces nothing | not applicable |
