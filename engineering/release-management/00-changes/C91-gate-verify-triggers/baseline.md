# C91 baseline

The baseline is `main` (8973fc3), with no commit of this Change.

- release/C90 is on `main`: release/CTL19 `verify Triggers` is a detective check; its workflow source `05-src/wiring/workflows/verify-triggers.yml` runs on `pull_request` only. Its install under `.github/workflows` is the WIRE of the pull request #1979 and is not part of this baseline.
- `05-src/wiring/rulesets/promoting.json` requires `verify Stages (Promoting)` and `analyze Vulnerabilities (Promoting)`; `stages.json` declares the same two checks, traced to release/CTL1 and release/CTL5.
- No control requires `verify Triggers`. A pull request into `main` that adds a use of `pull_request_target` can merge.
- The legacy promotion ruleset (24951062) is still live with its merge queue. A required check that does not run on `merge_group` would hold that queue.
- The ratchet passes on `main` against itself with five uses (`change-isolation`, `lineage-synchronization`, `merge-group-admission`, `promotion-source`, `sync-review`), so requiring it blocks no existing promotion.
