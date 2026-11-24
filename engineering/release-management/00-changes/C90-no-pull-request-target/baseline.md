# C90 baseline

The baseline is `main` (dca7172), with no commit of this Change.

- `.github/workflows` holds five workflows whose `on:` names `pull_request_target`. Each file also mentions the trigger in a comment, which is why a count by text search would be wrong.
- No control reads the triggers of a workflow. `verify Stages`, `verify Sync` and the envelope check judge other things.
- Nothing stops a pull request from adding a workflow that uses `pull_request_target`.
- GitHub blocks `pull_request_target` by default from 2 Dec 2026 unless an Actions policy allows it; the Owner rejected the exception ("that's cheating").

## From (recorded)

The workflows on `main` dca7172 whose `on:` names `pull_request_target`:

- `.github/workflows/change-isolation.yml`
- `.github/workflows/lineage-synchronization.yml`
- `.github/workflows/merge-group-admission.yml`
- `.github/workflows/promotion-source.yml`
- `.github/workflows/sync-review.yml`
