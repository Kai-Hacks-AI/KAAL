# C115 change

## Records

Five Defects, release/D13 to release/D17, one for each workflow that uses `pull_request_target` on `main` (af8f396): merge-group-admission, promotion-source, sync-review, change-isolation and Branching (`lineage-synchronization.yml`). Each has one Case, release/T1321 to release/T1325, RED on `main`: the workflow's top-level `on:` names the trigger, read by the reader release/CTL19 already uses. The expectation is release/I50, the Owner's directive.

The Cases are `.red.mjs`, as the target Case release/T1123 is: a RED `.test.mjs` under release-management is found by the Pull Promotion Cases and fails the Engineering check until the workflow is fixed. Each becomes a plain `.test.mjs` in the Change that fixes its workflow, the same Change that turns it GREEN.

## Ids

Change `release/C115`, Defects `release/D13` to `release/D17`, Cases `release/T1321` to `release/T1325`: the next free ones after main and the release collectors (D12, C114, T1320 at 21 Nov 08:13 UTC). Taken by hand; the release thread confirms.

## Remedy route (not part of the Defects)

Fix each workflow in its engineering source through the owning capability's Change, then WIRE it (`.github` travels alone), smallest first: merge-group-admission, promotion-source, sync-review, change-isolation, Branching. The trust design comes first, because under `pull_request` the workflow file comes from the head commit and a pull request could edit its own judge.
