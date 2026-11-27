# C42 do

The DO of the merged PLAN (#2718), approved by the CPO.

- **Source:** `13-source/workflows/ci.yml`, the live `ci.yml` with the `push` trigger removed and a `concurrency` group added (`ci-<pull request number or sha>`, cancelling only on `pull_request`). No job, matrix, name or permission changes.
- **Cases:** T1590 to T1592 were RED because the source did not exist and are now GREEN, unchanged.
- **What this Change does not do:** it does not touch `.github/workflows/ci.yml`. The WIRE copies the source byte-equal and needs the Owner's separate go. Release confirmed that C162 keys runs by sha and workflow file, so merge_group runs at main's revision are recognised before the WIRE.
