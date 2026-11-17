# C11 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/package-scope`, each by its own pull request, squashed.
2. ACT goes into the collector, and the collector goes to `main` as one promotion, squashed, after the CPO approves at its exact head. It queues behind the release promotion that holds the seat.

This PLAN authorizes no DO, no publication and no promotion.

## Smallest coherent promotion

`package.json`, `README.md` and the Case T13 of `packages/kaal-controls/`, plus this Change folder. Nothing outside the folder changes.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T590 to T592 green and all other Cases of the package still green | verified by Cases |
| Validated | The CPO reads F18 and judges that only the name changes | judgment, not a Case |
| Operational | None. The package is not published | not applicable |
