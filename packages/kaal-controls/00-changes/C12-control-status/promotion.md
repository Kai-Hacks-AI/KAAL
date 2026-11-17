# C12 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/control-status`, each by its own pull request, squashed.
2. ACT goes into the collector, and the collector goes to `main` as one promotion, squashed, after the CPO approves at its exact head.

This PLAN authorizes no publication and no promotion.

## Smallest coherent promotion

Everything under `packages/kaal-controls/` that this Change adds or edits. Nothing outside the folder changes. The controls of other capabilities that are on `main` are not edited here.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T770 to T775 green, and the Cases of C8 and C9 still green with a status | verified by Cases |
| Validated | The CPO reads F19 and A10 and judges that the four words are right and nothing more was added | judgment, not a Case |
| Operational | None. The finder lists and checks a value and enforces nothing | not applicable |
