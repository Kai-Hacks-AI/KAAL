# C8 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/ctl-items`, each by its own pull request, squashed.
2. Whether the collector goes to `main` is a separate decision on the Owner's go.
3. ACT goes to `main`, possibly through the collector.

This PLAN authorizes no DO, no publication and no promotion.

## Smallest coherent promotion

Everything under `packages/kaal-controls/` that this Change adds. Nothing outside the folder changes, and the package is not added to `workspaces`.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T470 to T479 green: shape, unique ids, listing across folders, tests found from the test side | verified by Cases |
| Validated | The CPO reads F13 and A8 and judges that the shape is right: id, title, description, has, and nothing else | judgment, not a Case |
| Operational | None. The finder lists controls and enforces nothing | not applicable |
