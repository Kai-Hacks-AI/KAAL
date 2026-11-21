# C115 change

## Records

Five Defects, release/D13 to release/D17, one for each workflow that uses `pull_request_target` on `main`: merge-group-admission, promotion-source, sync-review, change-isolation and Branching (`lineage-synchronization.yml`). The expectation is release/I50, the Owner's directive. Each Defect carries its reproduction with the reader release/CTL19 already uses, and no Case: the Case of each ships as a plain `.test.mjs` in the Change that fixes its workflow, together with the source, so it is never RED on a collector.

## Ids

Change `release/C115`, Defects `release/D13` to `release/D17`: the next free ones after `main` and the release collectors (D12 and C114 were the last). Taken by hand; the release thread confirms.

## Remedy route (not part of the Defects)

Fix each workflow in its engineering source through the owning capability's Change, then WIRE it (`.github` travels alone), smallest first: merge-group-admission, promotion-source, sync-review, change-isolation, Branching. The trust design comes first, because under `pull_request` the workflow file comes from the head commit and a pull request could edit its own judge.
